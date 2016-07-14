import { Component, ViewChild} from '@angular/core';
import { NavController } from 'ionic-angular';
import {ChatPage} from '../chat/chat';
import {Subscription} from 'rxjs';
import {ChatService} from '../../components/services/chat.service';
import {Auth} from '../../components/auth/auth';
import {ChatUser} from '../../components/models/chat-user';
import {User} from '../../components/models/user';
import {ChatSummaries} from '../../components/chat-summaries/chat-summaries';

@Component({
    templateUrl: 'build/pages/chats/chats.html',
    directives: [ChatSummaries]
})
export class ChatsPage {
    @ViewChild(ChatSummaries) chatSummaries: ChatSummaries;

    constructor(private nav: NavController) {

    }

    ionViewLoaded() {
        this.chatSummaries.loadChatSummaries();
    }

    onPageWillLeave() {
        this.chatSummaries.cleanResources();
    }



}
