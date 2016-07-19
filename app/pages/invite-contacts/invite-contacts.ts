import { Component } from '@angular/core';
import { NavController, NavParams, Platform, Loading, Alert } from 'ionic-angular';
import {ContactOrderPipe} from '../../pipes/contactOrderPipe';
import {InviteContactsService} from '../../components/services/invite-contact.service';
import * as lodash from 'lodash';

// Global
declare var window: any;
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
      case 'whatsapp':
        this.inviteWhatsApp(contact);
        break;
      case 'sms':
      default:
        this.sendSmsToContact(contact);
        break;
    }
  }


  sendSmsToContact(contact) {
    if (contact.phone && contact.phone.value)
      SocialSharing.shareViaSMS(this.inviteData.shareText, contact.phone.value).then((data) => {
        console.log(data);
      });
  }


  inviteWhatsApp(contact) {
    this.platform.ready().then(() => {
      if (window.plugins.socialsharing) {
        let phone = this.platform.is('android') ? contact.phone.value : contact.id;
        window.plugins.socialsharing.canShareVia('whatsapp', this.inviteData.messageText, null, null, null, (result) => {
          window.plugins.socialsharing.shareViaWhatsAppToReceiver(phone, this.inviteData.messageText, null, 'http://www.google.com/', (data) => {
            console.log(data);
          });
        }, (error) => {
          console.log(error);
          this.doErrorAlert('whatsapp');
        });
      }
    });
  }

  sendEmailToContact(contact) {
    let toArr = [contact.email.value];
    SocialSharing.shareViaEmail(this.inviteData.body, this.inviteData.subject, toArr, null, null, null).then((data) => {
      console.log(data);
    });
  }

  doErrorAlert(app) {
    let alert = Alert.create({
      title: `Can't share!`,
      subTitle: `Please check you have ${app} installed or UR Money app has access to that app`,
      buttons: ['OK']
    });
    this.nav.present(alert);
  }

}
