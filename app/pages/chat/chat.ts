import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {ChatsPage} from '../chats/chats';
import {Contact} from '../../components/models/contact';
import {ChatUser} from '../../components/models/chat-user';
import {Chat} from '../../components/models/chat';
import {ChatService} from '../../components/services/chat.service';

@Component({
    templateUrl: 'build/pages/chat/chat.html',
    providers: [ChatService]
})
export class ChatPage {
    tabBarElement: any;
    messages: any[];
    userId: ChatUser;
    contactFullname: string;
    contact: ChatUser;
    messageText: string;
    chat: Chat;
    chatId: string;

    constructor(private nav: NavController, public navParams: NavParams, private chatService: ChatService) {
        this.tabBarElement = document.querySelector('ion-tabbar-section');
        this.userId = this.navParams.get('user');
        this.contact = this.navParams.get('contact');

    }

    sendMessage() {
        if (!this.chat) {
            this.chatId = this.createChat();
        }
        // let message: Message = new Message();
        // message.userId = this.userId;
        // message.userName = this.myfullName;
        // message.sendAt = firebase.database.ServerValue.TIMESTAMP;
        // message.messageText = this.messageText;
        // message.chatId = this.chatId;
        //
        // console.log("sendaMessage()", message);
        // this.chatService.saveChatMessage(message);
        // console.log("saveLastMessage()", this.messageText);
        // this.chatService.saveLastMessage(message);
        // this.messageText = "";
    }

    createChat(): string {
        return this.chatService.createChat();
    }

    onPageWillEnter() {
        this.tabBarElement.style.display = 'none';
    }

    onPageWillLeave() {
        this.tabBarElement.style.display = 'block';
    }
}
