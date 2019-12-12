import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { MessageComponent } from './message/message.component';
import { ChatService } from './Services/chat.service';
import { CookieService } from 'ngx-cookie-service'

const config: SocketIoConfig = { url: 'http://localhost:3450', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    MessageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [
    ChatService,
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
