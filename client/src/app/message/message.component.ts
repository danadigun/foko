import { Component, OnInit } from '@angular/core';
import { ChatService } from '../Services/chat.service';
import { Observable } from 'rxjs';
import { Message } from '../models/message';
import * as uuid from 'uuid';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {

  messages : Array<Message> = [];
  message : Message;
  isRegistering : boolean = true;

  /**
   * Message form group
   */
  messageForm = new FormGroup({
    message : new FormControl('')
  });

  /**
   * Login form group
   */
  loginForm = new FormGroup({
    username : new FormControl('', Validators.required),
    password : new FormControl('', Validators.required)
  });

  /**
   * register form group
   */
  registerForm = new FormGroup({
    username : new FormControl('', Validators.required),
    password : new FormControl('', Validators.required)
  });
  
  constructor(private chatService : ChatService) { }

  ngOnInit() {
    this.chatService.getMessages().subscribe((messages) => {
      this.messages = Object.values(messages);
      console.log(this.messages)
    })
  }

  get hasAccount(){
    return this.isRegistering
  }

  toggleHasAccount(){
    this.isRegistering = !this.isRegistering;
  }

  async register(){
    await this.chatService.register(this.registerForm.value)
  }
  
  send(){
    this.message = this.messageForm.value;
    this.message.id = uuid.v4();
    this.message.user = this.user

    this.chatService.send(this.message);
    this.messageForm.reset();
  }

  
  async login(){
    let data = this.loginForm.value;
    let result = await this.chatService.login(data);
    if(!result.status){
      alert('Invalid username and password')
    }
  }

  async logout(){
    await this.chatService.logOut()
  }

  get isAuthenticated(){
    return this.chatService.user ? true : false
  }

  get user(){
    let user_data = this.chatService.user;
    let username = user_data.split('data')[1].split(':')[2].split(',')[0].split(`"`)[1];

    return this.isAuthenticated ? username : null;
  }

}
