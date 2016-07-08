import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {ContactOrderPipe} from '../../pipes/contactOrderPipe';

// Native Plugins
import {SocialSharing} from 'ionic-native';


/*
  Generated class for the InviteContactsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  pipes: [ContactOrderPipe],
  templateUrl: 'build/pages/invite-contacts/invite-contacts.html',
})
export class InviteContactsPage {
  contacts: any;
  inviteType: string;
  inviteData: any = {};
  constructor(private nav: NavController, private navParams: NavParams) {
    this.populateContacts();
    this.inviteType = this.navParams.get('inviteType');
    this.inviteData = this.navParams.get('inviteData');
  }

  inviteNow(contact) {
    switch (this.inviteType) {
      case 'email':
        this.sendEmailToContact(contact);
        break;
      case 'sms':
      default:
        this.sendSmsToContact(contact);
        break;
    }
  }


  sendSmsToContact(contact) {
    SocialSharing.shareViaSMS(this.inviteData.messageText, contact.phone).then((data) => {
      console.log(data);
    });
  }

  sendEmailToContact(contact) {
    let toArr = [contact.email];
    let ccArr = [''];
    let bccArr = [''];
    let file = [''];
    SocialSharing.shareViaEmail(this.inviteData.body, this.inviteData.subject, toArr, ccArr, bccArr, file).then((data) => {
      console.log(data);
    });
  }

  populateContacts() {
    this.contacts =
      [
        {
          'name': 'Jhon Doe',
          'imgID': '1',
          'city': 'Thimphu',
          'country': 'Bhutan',
          'email': 'JhonDoe@gmail.com',
          'phone': '+919915738619',
          'invite': true
        },
        {
          'name': 'Jenny Doe',
          'imgID': '2',
          'city': 'Ottawa',
          'country': 'Canada',
          'email': 'jennyDoe@ur.capital',
          'phone': '+919915738619',
          'invite': false
        },
        {
          'name': 'Rashi Doe',
          'imgID': '3',
          'city': 'Beijing',
          'country': 'China',
          'email': 'rashiDoe@gmail.com',
          'phone': '+919915738619',
          'invite': true
        },
        {
          'name': 'Jon Snow',
          'imgID': '4',
          'city': 'Bogota',
          'country': 'Colombia',
          'email': 'jonSnow@ur.capital',
          'phone': '+919915738619',
          'invite': true
        },
        {
          'name': 'Sansa Stark',
          'imgID': '5',
          'city': 'Havana',
          'country': 'Cuba',
          'email': 'sansaStark@gmail.com',
          'phone': '+919915738619',
          'invite': false
        },
        {
          'name': 'Ramsay Bolton',
          'imgID': '6',
          'city': 'Helsinki',
          'country': 'Finland',
          'email': 'ramsayBolton@ur.capital',
          'phone': '+919915738619',
          'invite': false
        },
        {
          'name': 'Daenerys',
          'imgID': '7',
          'city': 'Paris',
          'country': 'France',
          'email': 'daenerys@gmail.com',
          'phone': '+919915738619',
          'invite': true
        },
        {
          'name': 'Gregor Clegane',
          'imgID': '8',
          'city': 'Berlin',
          'country': 'Germany',
          'email': 'gregorClegane@ur.capital',
          'phone': '+919915738619',
          'invite': false
        },
        {
          'name': 'Khal Drogo',
          'imgID': '9',
          'city': 'Ankara',
          'country': 'Turkey',
          'email': 'khalDrogo@gmail.com',
          'phone': '+919915738619',
          'invite': true
        },
        {
          'name': 'Tyrion Lannister',
          'imgID': '10',
          'city': 'Washington, D.C.',
          'country': 'United States',
          'email': 'tyrionLannister@ur.capital',
          'phone': '+919915738619',
          'invite': false
        }
      ];
  }
}
