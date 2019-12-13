const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const db = require('./database/database');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const users = {};
const messages = {};
const groupMessages = {};

const sign_key = '359a6a04-d041-4ca3-96c0-386132fdcdca';

/**
 * Enable cors & body parser middleware
 */
app.use(cors());
app.use(bodyParser.json());

/**
 * Default endpoint
 */
app.get('/', async (req, res) => {
    res.json({
        'version' : "v1.0-alpha",
        'name' : 'Foko Chat API service.',
        'mode':'listening .....'
    })
})

/**
 * Register user
 */
app.post('api/auth/create', async(req, res) => {
    const { username, password } = req.body;

    var user = await db.find('users', { email : username });
    if(user.length > 0){
        return res.json({ status : false, message : 'user already exists!'})
    }
    //NOTE: this is not safe in production. passwords should be hashed 
    //before saving to db. this for demo purposes only
    var result = await db.commit('users', { email : username, password });

    return res.json({ status : true, message : 'successfully created user', result })
})

/**
 * Authentication end-point using JWT
 */
app.post('/api/auth', async (req, res) => {
    const { username, password } = req.body;

    var result = await db.find('users', { email: username, password });
    if (result.length === 0) {
        return res.json({ status: false, message: 'Invalid username or password!' })
    }
    else {
        let user = result.map(item => item)[0];

        var token = jwt.sign({ id: user.email }, sign_key, { expiresIn: '1h' })
        return res.json({ status: true, data: { token } })
    }
})

/**
 * Authorization token verification end-point
 */
app.get('/api/auth', async (req, res) => {
    let token = req.headers.authorization;

    jwt.verify(token, sign_key, function (err, decoded) {
        if (err) {
            return res.json({ status: false, message: 'authorization required!' })
        }

        return res.json({ status: true, message: 'authorization succeeded!', data: decoded })
    })
})

/**
 * WebSocket Events 
 */
io.of('/home').on('connection', socket => {
    let clients = io.of('/home').sockets
    let connectedClients = Object.keys(clients).length;

    if(connectedClients > 2){
        socket.emit('disconnect', { status : false, message : 'connections cannot be more than 2'})
        socket.disconnect();
    }

    /**
     * Event to handle message sending
     */
    socket.on('MessageSent', data => {
        sendMessage(data);
    })

    /**
     * Delete a Message
     */
    socket.on('RemoveMessage', id => {
        delete messages[id];

        io.sockets.emit('Messages', messages);
    })

    /**
     * Event to handle account creation. structure:
     * user = {
     *  id, email, password
     * }
     */
    socket.on('AccountCreated', async (user) => {
        if (!user.id || !user.email || !user.password) {
            socket.emit('AccountCreatedSucceeded', { ok: false, message: 'Invalid user credentials!' });
            return
        };

        if (!user.email.includes('@')) {
            socket.emit('AccountCreatedSucceeded', { ok: false, message: 'Username must be a valid email address!' });
            return
        }

        users[user.id] = user;
        socket.username = user.email;

        let result = await db.addUser({ email: user.email, password: user.password });
        console.log(result);

        socket.emit('AccountCreatedSucceeded', { ok: true, user });
    })

    /**
     * Event to handle user authentication. Structure:
     * user = {
     *  email, password
     * }
     */
    socket.on('UserAuthenticated', user => {
        if (!user.email || !user.email.includes('@')) {
            socket.emit('UserAuthenticatedSucceeded', { ok: false, message: 'Invalid username id!' });
            return;
        }
        socket.username = user.email;
        socket.emit('UserAuthenticatedSucceeded', { ok: true, user });
    })

});

/**
 * Group chat
 */
io.of('/group').on('connection', socket => {
    let clients = io.of('/group').sockets
    let connectedClients = Object.keys(clients).length;

    if(connectedClients > 10){
        socket.emit('disconnect', { status : false, message : 'connections to group cannot be more than 10'})
        socket.disconnect();
    }

    socket.on('MessageSent', data => {
        sendMessageToGroup(data);
    })
})

/**
 * Listen for connecitons 
 */
let port = process.env.PORT || 3450;
http.listen(port, () => console.log(`listening on port ${port}..`))



/**
 * Global function to send message
 * @param {Object} data message data
 * 
 * Structure of data
 * =================
 * { id, user : <email>, message }
 */
function sendMessage(data) {
    let message = { id: data.id, user: data.user, message: data.message };
    messages[data.id] = message;
    console.log(message);
    io.of('/home').emit('Messages', messages);
}

/**
 * Global function to send message to group
 * @param {Object} data message data
 * 
 * Structure of data
 * =================
 * { id, user : <email>, message }
 */
function sendMessageToGroup(data) {
    let message = { id: data.id, user: data.user, message: data.message };
    groupMessages[data.id] = message;
    console.log(message);
    io.of('/group').emit('Messages', groupMessages);
}
