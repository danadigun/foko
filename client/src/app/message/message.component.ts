import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../Services/chat.service';
import { Observable, Subscription } from 'rxjs';
import { Message } from '../models/message';
import * as uuid from 'uuid';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, OnDestroy {

  messages: Array<Message> = [];
  message: Message;

  groupMessage: Message;
  groupMessages: Array<Message> = [];

  isRegistering: boolean = true;
  isGroup: boolean = false;

  /**
   * Message form group
   */
  messageForm = new FormGroup({
    message: new FormControl('')
  });

  /**
   * Group Chat Message form group
   */
  groupMessageForm = new FormGroup({
    message: new FormControl('')
  });


  /**
   * Login form group
   */
  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  /**
   * register form group
   */
  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  connectionSubscription: Subscription;
  groupConnectionSubscription: Subscription;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.chatService.getMessages().subscribe((messages) => {
      this.messages = Object.values(messages);
      console.log(this.messages)
    })

    this.chatService.getGroupMessages().subscribe((messages) => {
      this.groupMessages = Object.values(messages);
      console.log(this.groupMessages)
    })


    this.connectionSubscription = this.chatService
      .isConnectionsGreaterThanTwo().subscribe(async (result) => {
        if (!result.status) {
          alert('More than 2 Connections cannot be allowed. Please close browser');
          await this.logout();
        }
      })
      
    this.groupConnectionSubscription = this.chatService
      .isGroupConnectionsGreaterThanTen().subscribe(async (result) => {
        if (!result.status) {
          alert('More than 10 Connections cannot be allowed in a group. Please close browser');
          await this.logout();
        }
      })


  }

  async ngOnDestroy() {
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe()
      this.groupConnectionSubscription.unsubscribe()
    }
    await this.logout();
  }

  get hasAccount() {
    return this.isRegistering
  }

  toggleHasAccount() {
    this.isRegistering = !this.isRegistering;
  }

  async register() {
    await this.chatService.register(this.registerForm.value)
  }

  send() {
    this.message = this.messageForm.value;
    this.message.id = uuid.v4();
    this.message.user = this.user

    this.chatService.send(this.message);
    this.messageForm.reset();
  }

  sendToGroup() {
    this.message = this.groupMessageForm.value;
    this.message.id = uuid.v4();
    this.message.user = this.user

    this.chatService.sendToGroup(this.message);
    this.groupMessageForm.reset();
  }

  async joinGroup() {
    this.isGroup = true;
  }

  async leaveGroup() {
    this.isGroup = false;
  }


  async login() {
    let data = this.loginForm.value;
    let result = await this.chatService.login(data);
    if (!result.status) {
      alert('Invalid username and password')
    }
  }

  async logout() {
    await this.chatService.logOut()
  }

  get isAuthenticated() {
    return this.chatService.user ? true : false
  }

  get user() {
    let user_data = this.chatService.user;
    let username = user_data.split('data')[1].split(':')[2].split(',')[0].split(`"`)[1];

    return this.isAuthenticated ? username : null;
  }

}
