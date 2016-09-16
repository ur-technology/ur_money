import {Page, NavController, NavParams, Platform} from 'ionic-angular';
import {  OnInit } from '@angular/core';
import {ContactsComponent} from '../../components/contacts/contacts';
import {ChatListComponent} from '../../components/chat-list/chat-list';
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";
declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/contacts-and-chats/contacts-and-chats.html',
  directives: [ContactsComponent, ChatListComponent],
  pipes: [TranslatePipe]
})
export class ContactsAndChatsPage {
  contactsPage: any;
  goal: any;
  chatsPage: any;
  segmentSelected: string = "contacts";

  constructor(private nav: NavController, private navParams: NavParams, public platform: Platform) {
    this.goal = navParams.get("goal");
  }

  ngOnInit() {
    jQuery(".contentPage").css("top", this.platform.is('ios')?"63px":"43px");
  }

}
