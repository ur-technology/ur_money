import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {ChatPage} from '../chat/chat';

/*
  Generated class for the ChatsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/chats/chats.html',
})
export class ChatsPage {
  chats: any;
  constructor(private nav: NavController) {
    this.populateChat();
  }

  moveToChat(conversation) {
    this.nav.setRoot(ChatPage, { conversation: conversation }, { animate: true, direction: 'forword' });
  }
  

  populateChat() {
    this.chats =
      [
        {
          "name": "Jhon Doe",
          "imgID": "1",
          "city": "Thimphu",
          "country": "Bhutan",
          "time": "02:52 pm"
        },
        {
          "name": "Jenny Doe",
          "imgID": "2",
          "city": "Ottawa",
          "country": "Canada",
          "time": "10:47 am"
        },
        {
          "name": "Rashi Doe",
          "imgID": "3",
          "city": "Beijing",
          "country": "China",
          "time": "21-06-2016"
        },
        {
          "name": "Jon Snow",
          "imgID": "4",
          "city": "Bogota",
          "country": "Colombia",
          "time": "21-06-2016"
        },
        {
          "name": "Sansa Stark",
          "imgID": "5",
          "city": "Havana",
          "country": "Cuba",
          "time": "20-06-2016"
        },
        {
          "name": "Ramsay Bolton",
          "imgID": "6",
          "city": "Helsinki",
          "country": "Finland",
          "time": "19-06-2016"
        },
        {
          "name": "Daenerys",
          "imgID": "7",
          "city": "Paris",
          "country": "France",
          "time": "18-06-2016"
        },
        {
          "name": "Gregor Clegane",
          "imgID": "8",
          "city": "Berlin",
          "country": "Germany",
          "time": "17-06-2016"
        },
        {
          "name": "Khal Drogo",
          "imgID": "9",
          "city": "Ankara",
          "country": "Turkey",
          "time": "16-05-2016"
        },
        {
          "name": "Tyrion Lannister",
          "imgID": "10",
          "city": "Washington, D.C.",
          "country": "United States",
          "time": "15-05-2016"
        }
      ];
  }
}
