import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {ChatPage} from '../chat/chat';
import {Subscription} from 'rxjs';
import {ChatService} from '../../components/services/chat.service';
import {Auth} from '../../components/auth/auth';
import {ChatUser} from '../../components/models/chat-user';
import {User} from '../../components/models/user';

@Component({
    templateUrl: 'build/pages/chats/chats.html',
    providers: [ChatService]
})
export class ChatsPage {
    chats: any[];
    chatsRef: Subscription;
    userId: string;

    constructor(private nav: NavController, private chatService: ChatService, private auth: Auth) {
        this.userId = auth.uid;
    }

    moveToChat(conversation) {
        this.nav.setRoot(ChatPage, { conversation: conversation }, { animate: true, direction: 'forword' });
    }

    loadChatSummaries() {
        this.chatsRef = this.chatService.getChatSummaries(this.userId).subscribe(data => {
            this.chats = data;
        });
    }
    ionViewLoaded() {
        this.loadChatSummaries();
    }

    onPageWillLeave() {
        if (this.chatsRef && !this.chatsRef.isUnsubscribed) {
            this.chatsRef.unsubscribe();
        }
    }

    whoSentMessage(chatSelected: any) {
        return chatSelected.lastMessage.senderUid === this.userId ? "You: " : "";
    }

    gotoChat(chatSelected: any) {
        let userChat: ChatUser = new ChatUser();
        userChat.firstName = this.auth.userFirstname;
        userChat.lastName = this.auth.userLastname;
        userChat.userUid = this.userId;

        let contactUser: ChatUser = new ChatUser();
        contactUser.firstName = chatSelected.otherUser.firstName;
        contactUser.lastName = chatSelected.otherUser.lastName;
        contactUser.userUid = chatSelected.otherUser.userUid;

        this.nav.push(ChatPage, { chatId: chatSelected.chatId, user: userChat, contact: contactUser }, { animate: true, direction: 'forward' });
    }

    getChatUser(object: any): ChatUser {
        let chatUser: ChatUser = new ChatUser();
        chatUser.firstName = object.firstName;
        chatUser.lastName = object.lastName;
        chatUser.userUid = object.$key;
        chatUser.profilePhotoUrl = object.profilePhotoUrl ? object.profilePhotoUrl : "";
        return chatUser;
    }

}
