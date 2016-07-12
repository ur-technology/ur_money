import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {ContactsPage} from '../contacts/contacts';
import {ChatPage} from '../chat/chat';
import {ChatsPage} from '../chats/chats';


@Component({
  templateUrl: 'build/pages/conversation/conversation.html',
})
export class ConversationPage {
  contactsPage: any;
  chatsPage: any;
  constructor(private nav: NavController) {
    this.chatsPage = ChatsPage;
    this.contactsPage = ContactsPage;
  }
}
