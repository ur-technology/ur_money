import { Component } from '@angular/core';
import {Subscription} from 'rxjs';
import { NavController } from 'ionic-angular';
import {ChatService} from '../../components/services/chat.service';
import {Auth} from '../../components/auth/auth';
import {ChatPage} from '../../pages/chat/chat';
import {ChatUser} from '../../components/models/chat-user';
import {Timestamp}  from '../../pipes/timestamp';

@Component({
    selector: 'chat-summaries',
    templateUrl: 'build/components/chat-summaries/chat-summaries.html',
    pipes: [Timestamp]
})
export class ChatSummaries {
    chats: any[];
    chatsRef: Subscription;
    user: any;

    constructor(private nav: NavController, private chatService: ChatService, auth: Auth) {
        this.user = auth.userObject;
    }

    loadChatSummaries() {
        this.chatsRef = this.chatService.getChatSummaries(this.user.$key).subscribe(data => {
            this.chats = data;
        });
    }

    cleanResources() {
        if (this.chatsRef && !this.chatsRef.isUnsubscribed) {
            this.chatsRef.unsubscribe();
        }
    }

    whoSentMessage(chatSelected: any) {
        return chatSelected.lastMessage.senderUid === this.user.$key ? "You: " : "";
    }

    gotoChat(chatSelected: any) {

        let userChat: ChatUser = new ChatUser();
        userChat.firstName = this.user.firstName;
        userChat.lastName = this.user.lastName;
        userChat.userUid = this.user.$key;
        userChat.profilePhotoUrl = this.user.profilePhotoUrl;

        let contactUser: ChatUser = new ChatUser();
        contactUser.firstName = chatSelected.otherUser.firstName;
        contactUser.lastName = chatSelected.otherUser.lastName;
        contactUser.userUid = chatSelected.otherUser.userUid;
        contactUser.profilePhotoUrl = chatSelected.profilePhotoUrl ? chatSelected.profilePhotoUrl : "";

        this.nav.rootNav.push(ChatPage, { chatId: chatSelected.chatId, user: userChat, contact: contactUser }, { animate: true, direction: 'forward' });
    }

}
