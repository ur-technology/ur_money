import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import {ChatsPage} from '../chats/chats';
import {User} from '../../components/models/user';
import {ChatUser} from '../../components/models/chat-user';
import {Chat} from '../../components/models/chat';
import {ChatService} from '../../components/services/chat.service';
import {ChatMessage} from '../../components/models/chat-message';
import {Subscription} from 'rxjs';
import {Timestamp}  from '../../pipes/timestamp';
import * as _ from 'underscore';

@Component({
    templateUrl: 'build/pages/chat/chat.html',
    pipes: [Timestamp],
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
    messagesRef: Subscription;
    @ViewChild(Content) content: Content;

    constructor(private nav: NavController, public navParams: NavParams, private chatService: ChatService) {
        this.tabBarElement = document.querySelector('ion-tabbar-section');
        this.user = this.navParams.get('user');
        this.contact = this.navParams.get('contact');
        this.chatId = this.navParams.get('chatId');


    }
    scrollToBottom() {
        this.content.scrollToBottom();
    }

    ionViewLoaded() {
        this.findChatAndLoadMessages();
        this.scrollToBottom();
    }

    findChatAndLoadMessages() {
        if (this.chatId) {
            this.loadMessages();
        }
        else {
            this.chatService.findChatId(this.user, this.contact).then((chatId: string) => {
                this.chatId = chatId;
                this.loadMessages();
                  // this.scrollToBottom();
            });
        }
    }

    loadMessages() {
        this.messagesRef = this.chatService.getChatMessages(this.chatId).subscribe(data => {
            this.messages = data;
        });
    }

    messageNotMe(message: any) {
        return message.senderUid !== this.user.userUid;
    }

    validateMessage(): boolean {
        if (!this.messageText) {
            return false;
        }
        if (_.isEmpty(this.messageText.trim())) {
            return false;
        }
        return true;
    }


    sendMessage() {
        if (!this.validateMessage()) {
            return;
        }

        this.createChat();
        let chatMessage = this.createChatMessageObject();
        this.chatService.addMessageToChat(this.chatId, chatMessage);
        this.chatService.addChatSummaryToUser(this.user.userUid, this.contact, chatMessage, this.chatId);
        this.chatService.addChatSummaryToUser(this.contact.userUid, this.user, chatMessage, this.chatId);
        this.messageText = "";

    }

    createChatMessageObject(): ChatMessage {
        let chatMessage: ChatMessage = new ChatMessage();
        chatMessage.text = this.messageText;
        chatMessage.sentAt = firebase.database.ServerValue.TIMESTAMP;
        chatMessage.senderUid = this.user.userUid;
        return chatMessage;
    }

    createChat() {
        if (!this.chatId) {
            this.chatId = this.chatService.createChat(this.user, this.contact);
            this.loadMessages();
        }
    }


    ionViewWillLeave() {
        if (this.messagesRef && !this.messagesRef.isUnsubscribed) {
            this.messagesRef.unsubscribe();
        }
    }
}
