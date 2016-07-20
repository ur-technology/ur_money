import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {ContactsPage} from '../contacts/contacts';
import {ChatPage} from '../chat/chat';
import {ChatsPage} from '../chats/chats';


@Component({
  templateUrl: 'build/pages/contacts-and-chats/contacts-and-chats.html',
})
export class ContactsAndChatsPage {
  contactsPage: any;
  chatsPage: any;
  navbBarElement: any;

  constructor(private nav: NavController) {
    this.chatsPage = ChatsPage;
    this.contactsPage = ContactsPage;
  }

  ionViewLoaded() {
      this.navbBarElement = document.querySelector('ion-navbar-section');
      this.navbBarElement.style.display = 'none';
  }

}
