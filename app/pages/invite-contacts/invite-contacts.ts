import { Component } from '@angular/core';
import { NavController, NavParams, Platform, Loading } from 'ionic-angular';
import {ContactOrderPipe} from '../../pipes/contactOrderPipe';
import {InviteContactsService} from '../../components/services/invite-contact.service';
import * as lodash from 'lodash';
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
  contacts = [];
  inviteType: string;
  pageNumber = 1;
  maxPageCount: Number;
  size = 20;
  inviteData: any = {};
  loading: Loading;
  constructor(private nav: NavController, private navParams: NavParams,
    private platform: Platform, private inviteContactsService: InviteContactsService) {
    this.contacts = inviteContactsService.contacts;
    this.maxPageCount = inviteContactsService.getContactsLength();
    this.inviteType = this.navParams.get('inviteType');
    this.inviteData = this.navParams.get('inviteData');
  }


  doInfinite(infiniteScroll) {
    this.pageNumber++;
    let nextContatcs = this.inviteContactsService.getNextContacts(this.pageNumber, this.size);
    this.contacts = lodash.concat(this.contacts, nextContatcs);
    infiniteScroll.complete();
    if (this.contacts.length === this.maxPageCount) {
      infiniteScroll.enable(false);
    }
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
    if (contact.phone && contact.phone.value)
      SocialSharing.shareViaSMS(this.inviteData.messageText, contact.phone.value).then((data) => {
        console.log(data);
      });
  }

  sendEmailToContact(contact) {
    let toArr = [contact.email];
    SocialSharing.shareViaEmail(this.inviteData.body, this.inviteData.subject, toArr, null, null, null).then((data) => {
      console.log(data);
    });
  }



}
