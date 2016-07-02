import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {ChatsPage} from '../chats/chats';

/*
  Generated class for the ChatPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/chat/chat.html',
})
export class ChatPage {
  tabBarElement: any;
  conversation: any;
  messages: any[];
  constructor(private nav: NavController, public navParams: NavParams) {
    this.tabBarElement = document.querySelector('ion-tabbar-section');
    this.conversation = this.navParams.get('conversation');
    this.messages = [
      { "userID": "1", "text": "Hi,I just sent 3000 UR in your account. Let me know if you need more.", "time": "21-june-2016" },
      { "userID": "2", "text": "Hey, Thanks for the 3000 UR you sent my way. I really appreciate that. Let's catch up on the weekend.", "time": "22-june-2016" }
    ];
  }

  moveBack() {
    this.nav.setRoot(ChatsPage, {}, { animate: true, direction: 'back' });
  }
  onPageWillEnter() {

    this.tabBarElement.style.display = 'none';

  }

  onPageWillLeave() {

    this.tabBarElement.style.display = 'block';

  }
}
