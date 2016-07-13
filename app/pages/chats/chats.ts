import {Component, ViewChild} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ChatList} from '../../components/chat-list/chat-list';

@Component({
    templateUrl: 'build/pages/chats/chats.html',
    directives: [ChatList]
})
export class ChatsPage {
    constructor(private nav: NavController) {
    }
}
