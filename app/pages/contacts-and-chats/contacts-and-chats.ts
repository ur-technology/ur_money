import {Page, NavController, NavParams} from 'ionic-angular';
import {ContactsComponent} from '../../components/contacts/contacts';
import {ChatListComponent} from '../../components/chat-list/chat-list';
declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/contacts-and-chats/contacts-and-chats.html',
  directives: [ContactsComponent, ChatListComponent]
})
export class ContactsAndChatsPage {
  contactsPage: any;
  goal: any;
  chatsPage: any;
  segmentSelected:string = "contacts";

  constructor(private nav: NavController, private navParams: NavParams) {
    this.goal = navParams.get("goal");
  }

}
