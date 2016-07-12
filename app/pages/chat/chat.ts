import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {ChatsPage} from '../chats/chats';
import {User} from '../../components/models/user';
import {ChatUser} from '../../components/models/chat-user';
import {Chat} from '../../components/models/chat';
import {ChatService} from '../../components/services/chat.service';
import {ChatMessage} from '../../components/models/chat-message';

@Component({
    templateUrl: 'build/pages/chat/chat.html',
    providers: [ChatService]
})
export class ChatPage {
    tabBarElement: any;
    messages: any[];
    user: ChatUser;
    contactFullname: string;
    contact: ChatUser;
    messageText: string;
    chat: Chat;
    chatId: string;

    constructor(private nav: NavController, public navParams: NavParams, private chatService: ChatService) {
        this.tabBarElement = document.querySelector('ion-tabbar-section');
        this.user = this.navParams.get('user');
        this.contact = this.navParams.get('contact');

    }

    sendMessage() {
        if (!this.chatId) {
            this.createChat();
        }
        let chatMessage: ChatMessage = new ChatMessage();
        chatMessage.text = this.messageText;
        chatMessage.sentAt = firebase.database.ServerValue.TIMESTAMP;
        chatMessage.senderUid = this.user.userUid;
        this.chatService.addMessageToChat(this.chatId, chatMessage);

        this.chatService.addChatSummaryToUser(this.user.userUid, this.user, chatMessage);
        this.chatService.addChatSummaryToUser(this.contact.userUid, this.user, chatMessage);
        this.messageText = "";
    }

    createChat() {
        this.chatId = this.chatService.createChat(this.user, this.contact);
    }



    onPageWillEnter() {
        this.tabBarElement.style.display = 'none';
    }

    onPageWillLeave() {
        this.tabBarElement.style.display = 'block';
    }
}
