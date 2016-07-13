import { Component } from '@angular/core';
import {Subscription} from 'rxjs';
import {ChatService} from '../../components/services/chat.service';
import {Auth} from '../../components/auth/auth';

@Component({
    selector: 'chat-summaries',
    templateUrl: 'build/components/chat-summaries/chat-summaries.html',
    providers: [ChatService]
})
export class ChatSummaries {
    chatsRef: Subscription;
    chats: any[];
    userId: string;


    constructor(private chatService: ChatService, auth: Auth) {
        this.userId = auth.uid;
    }

    loadChatSummaries() {
        this.chatsRef = this.chatService.getChatSummaries(this.userId).subscribe(data => {
            this.chats = data;
        });
    }

    cleanResources() {
        if (this.chatsRef && !this.chatsRef.isUnsubscribed) {            
            this.chatsRef.unsubscribe();
        }
    }
}
