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
        console.log("loadChatSummaries()");
        this.chatsRef = this.chatService.getChatSummaries(this.userId).subscribe(data => {
            console.log("loadChatSummaries()", data);
            this.chats = data;
        });
    }

    cleanResources() {
        if (this.chatsRef && !this.chatsRef.isUnsubscribed) {
            console.log("cleanResources()");
            this.chatsRef.unsubscribe();
        }
    }
}
