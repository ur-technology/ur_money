import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {ChatsPage} from '../chats/chats';
import {User} from '../../components/models/user';
import {ChatUser} from '../../components/models/chat-user';
import {Chat} from '../../components/models/chat';
import {ChatService} from '../../components/services/chat.service';
import {ChatMessage} from '../../components/models/chat-message';
import {Subscription} from 'rxjs';
import {Timestamp}  from '../../pipes/timestamp';

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

    constructor(private nav: NavController, public navParams: NavParams, private chatService: ChatService) {
        this.tabBarElement = document.querySelector('ion-tabbar-section');
        this.user = this.navParams.get('user');
        this.contact = this.navParams.get('contact');
        this.chatId = this.navParams.get('chatId');


    }
    ionViewLoaded() {
        this.findChatAndLoadMessages();
    }

    findChatAndLoadMessages() {
        if (this.chatId) {
            this.loadMessages();
        }
        else {
            this.chatService.findChatId(this.user, this.contact).then((chatId: string) => {
                this.chatId = chatId;
                this.loadMessages();
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

    sendMessage() {
        if (!this.chatId) {
            this.createChat();
            this.loadMessages();
        }
        let chatMessage: ChatMessage = new ChatMessage();
        chatMessage.text = this.messageText;
        chatMessage.sentAt = firebase.database.ServerValue.TIMESTAMP;
        chatMessage.senderUid = this.user.userUid;
        this.chatService.addMessageToChat(this.chatId, chatMessage);

        this.chatService.addChatSummaryToUser(this.user.userUid, this.contact, chatMessage, this.chatId);
        this.chatService.addChatSummaryToUser(this.contact.userUid, this.user, chatMessage, this.chatId);
        this.messageText = "";
    }

    createChat() {
        this.chatId = this.chatService.createChat(this.user, this.contact);

    }


    ionViewWillLeave() {
        if (this.messagesRef && !this.messagesRef.isUnsubscribed) {          
            this.messagesRef.unsubscribe();
        }
    }
}
