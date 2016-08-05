import {Component, ViewChild} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ChatListComponent} from '../../components/chat-list/chat-list';

@Component({
    templateUrl: 'build/pages/chats/chats.html',
    directives: [ChatListComponent]
})
export class ChatsPage {
    constructor(private nav: NavController) {
    }
}
