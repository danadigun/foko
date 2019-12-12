import { Injectable } from '@angular/core';
import { Message } from '../models/message';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class ChatService {
    private socket;
    private url = 'http://localhost:3450';

    constructor(private cookieService : CookieService) {
         this.socket = io(this.url); 
    }

    getMessages() {
        return Observable.create((observer) => {
            this.socket.on('Messages', (messages) => {
                observer.next(messages)
            })
        })
    }
    isConnectionsGreaterThanTwo(){
        return Observable.create((observer) => {
            this.socket.on('disconnect', (result) => {
                observer.next(result);
            })
        })
    }

    send(message: Message) {
        this.socket.emit('MessageSent', message)
    }

    remove(id: String) {
        this.socket.emit('RemoveMessage', id);
    }

    async register( { username, password }){
        let response = (await axios.post(`${this.url}/api/auth/create`, { username, password })).data;
        if(response.status){
            alert(response.message);
            return await this.login({ username, password })
        }   
        return alert(response.message)
    }

    async login({ username, password }) {
        let response = (await axios.post(`${this.url}/api/auth`, { username, password })).data;
        if (response.status) {
            this.cookieService.set('token', JSON.stringify(response.data), 1 );
            await this.setUser();

            return { status: true }
        } else {
            return { status: false, message: response.message }
        }
    }

    private async setUser() {
        let auth_response = JSON.parse(this.cookieService.get('token'));
        let token = auth_response.token;

        let response = await fetch(`${this.url}/api/auth`, {
            headers: {
                authorization: token
            }
        })

        let user = await response.json();
        this.cookieService.set('user', JSON.stringify(user));
    }

    async logOut() {
        this.cookieService.delete('token')
        this.cookieService.delete('user');        
        window.location.href = '/'
    }

    get user() {
        return this.cookieService.get('user');
    }
}