const MongoClient = require('mongodb').MongoClient;
const config = require('./config');
const client = new MongoClient(config.database_url, { useUnifiedTopology: true })

class Database {
   
    /**
     * returns database object to connect client
     */
    static async getDb() {
        await client.connect();
        const db = client.db(config.database_name);

        return db;
    }

    /**
     * commit a single object to database
     * @param {String} collection database collection to write to 
     * @param {Object} object object/state to save
     */
    static async commit(collection, object) {

        try {
            const db = await this.getDb();

            let r = await db.collection(collection).insertOne(object);
            return r;

        } catch (error) {
            console.log(error);
        }
    }

    /**
    * commmit an array of objects 
    * @param {String} collection Database collection to write to
    * @param {Array} objects Array or objects/states to save 
    */
    static async commitMany(collection, objects) {
        try {
            const db = await this.getDb();

            let r = await db.collection(collection).insertMany(objects);
            return r;

        } catch (error) {
            console.log(error);
        }
    }

    /**
    * Returns all the documents in a collection
    * @param {String} collection Database collection to read from
    */
    static async all(collection) {
        try {
            const db = await this.getDb();
            const result = await db.collection(collection).find({}).toArray();
            return result;

        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Finds by a query object
     * @param {String} collection 
     * @param {Object} query 
     * @returns {Array} Array of documents
     */
    static async find(collection, query = {}) {
        try {
            const db = await this.getDb();
            const result = await db.collection(collection).find(query).toArray();
            return result;

        } catch (error) {
            console.log(error);
        }
    }

    /**
    * retrieves data from database using the document Id
    * @param {String} collection collection name
    * @param {string} id firestore document Id
    */
    static async getById(collection, id) {
        try {
            const db = await this.getDb();

            const result = await db.collection(collection).find({ _id: ObjectId(id) }).toArray();
            return result[0];

        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Updates any database document
     * @param {String} collection the collection where the document belongs
     * @param {Object} object the new object to update
     * @param {String} id the id of the document
     */
    static async update(collection, id, object) {
        try {
            const db = await this.getDb();

            const r = await db.collection(collection).updateOne({ _id: ObjectId(id) }, { $set: object }, { upsert: true })
            return r.result;

        } catch (error) {
            console.log(error);
        }
    }

    /**
    * removes a document from a collection
    * @param {String} collection collection to delete from
    * @param {String} id document to delete
    */
    static async remove(collection, id) {
        try {
            const db = await this.getDb();
            const r = await db.collection(collection).deleteOne({ _id: ObjectId(id) })
            return r.result;

        } catch (error) {
            console.log(error);
        }

    }
}

module.exports = Database;