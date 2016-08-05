import {Page, NavController, NavParams} from 'ionic-angular';
import {ContactsPage} from '../contacts/contacts';
import {ChatsPage} from '../chats/chats';

@Page({
  templateUrl: 'build/pages/contacts-and-chats/contacts-and-chats.html',
})
export class ContactsAndChatsPage {
  contactsPage: any;
  contactsPageParams: any;
  chatsPage: any;
  navbBarElement: any;

  constructor(private nav: NavController, private navParams: NavParams) {
    this.contactsPage = ContactsPage;
    this.contactsPageParams = { goal: navParams.get("goal") };
    this.chatsPage = ChatsPage;
  }

  ionViewLoaded() {
    this.navbBarElement = document.querySelector('ion-navbar-section');
    this.navbBarElement.style.display = 'none';
  }

}
