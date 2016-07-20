import { Component, ViewChild} from '@angular/core';
import { NavController } from 'ionic-angular';
import {ChatPage} from '../chat/chat';
import {Subscription} from 'rxjs';
import {Auth} from '../../components/auth/auth';
import {ChatSummaries} from '../../components/chat-summaries/chat-summaries';

@Component({
    templateUrl: 'build/pages/chats/chats.html',
    directives: [ChatSummaries]
})
export class ChatsPage {


    constructor(private nav: NavController) {

    }

    ionViewLoaded() {

    }

    onPageWillLeave() {

    }



}
