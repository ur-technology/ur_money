import { Component } from '@angular/core';
import {NavController, NavParams, ActionSheet, Platform, Alert} from 'ionic-angular';
import {SocialSharing, Clipboard, Toast} from 'ionic-native';
import {ContactsService} from '../../services/contacts-service';
import {Auth} from '../../services/auth';
import {ChatPage} from '../chat/chat';
import {Invite} from '../../models/invite';
import {Config} from '../../config/config';
import {User} from '../../models/user';
import * as _ from 'lodash';
import * as log from 'loglevel';
declare var window: any;

@Component({
  templateUrl: 'build/pages/contacts/contacts.html'
})
export class ContactsPage {
  pageIndex = 0;
  numberOfPages = 0;
  PAGE_SIZE = 15;
  paginatedContacts: any[] = [];
  displayableContacts: any[];
  startTime: number;
  public nonMembersFirst: boolean;

  constructor(
    private nav: NavController,
    private navParams: NavParams,
    private contactsService: ContactsService,
    private auth: Auth,
    private platform: Platform
  ) {
    this.startTime = (new Date()).getTime();
    this.nonMembersFirst = navParams.get("nonMembersFirst")
  }

  ionViewDidEnter() {
    let self = this;
    self.contactsService.load(self.auth.countryCode, self.auth.currentUserId).then((contactGroups: any) => {
      let contacts = self.nonMembersFirst ? contactGroups.nonMembers.concat(contactGroups.members) : contactGroups.members.concat(contactGroups.nonMembers);
      self.paginatedContacts = _.chunk(contacts, self.PAGE_SIZE);
      self.numberOfPages = self.paginatedContacts.length;
      self.displayableContacts = self.paginatedContacts[0];
      let timeElapsed = (new Date()).getTime() - self.startTime;
      log.debug("milliseconds elapsed", timeElapsed);
      log.debug("contactGroups.nonMembers.length", contactGroups.nonMembers.length);
      log.debug("contactGroups.members.length", contactGroups.members.length);
    });
  }

  doInfinite(infiniteScroll) {
    this.pageIndex++;
    if (this.pageIndex <= this.numberOfPages - 1) {
      this.displayableContacts = this.displayableContacts.concat(this.paginatedContacts[this.pageIndex]);
    }
    infiniteScroll.complete();
    if (this.pageIndex >= this.numberOfPages - 1) {
      infiniteScroll.enable(false);
    }
  }

  contactSelected(contact: any) {
    if (contact.userId) {
      this.nav.rootNav.push(ChatPage, { contact: contact });
    } else {
      this.inviteContact(contact);
    }
  }

  inviteContact(contact: any) {
    let self = this;
    let invitationCode = self.generateInvitationCode();
    if (!this.platform.is('cordova')) {
      // HACK: this code is here to test invitations in ionic serve
      let alert = Alert.create({title: 'Simulating social sharing action sheet', message: 'Invitation added to queue!', buttons: ['Ok']});
      this.nav.present(alert);
      self.addNewInvitationToQueue(contact, invitationCode);
      return;
    }
    let message = `I downloaded the UR money app and got 2,000 units of cryptocurrency for free. To learn more and get yours free too, visit `;
    Clipboard.copy(message).then((data) => {
      Toast.show("Pick an app and type a message. Or you can paste the simple message that we've placed in your clipboard.", 'long', 'top').subscribe((toast) => {
        SocialSharing.shareWithOptions({
          message: message, // not supported on some apps (Facebook, Instagram)
          file: 'https://ur-money-staging.firebaseapp.com/img/icon.png',
          url: `${Config.appDownloadUrl}`,
          chooserTitle: 'Pick an app' // Android only
        }).then((result) => {
          log.debug("returned from SocialSharing.shareWithOptions; saving dowlineUser");
          self.addNewInvitationToQueue(contact, invitationCode);
        }, (error) => {
          log.warn("Sharing failed with message: " + error);
        });
      });
    });
  }

  private addNewInvitationToQueue(contact, invitationCode) {
    let taskRef = firebase.database().ref('/invitationQueue/tasks').push({
      sponsorUserId: this.auth.currentUserId,
      invitee: {
        firstName: contact.firstName,
        middleName: contact.middleName || null,
        lastName: contact.lastName,
        phone: contact.phone,
        invitationCode: invitationCode
      }
    });
  }

  private generateInvitationCode(): string {
    let code: string = '';
    let letters = "ABCDEFGHKMNPRSTWXYZ2345689";
    for (var i = 0; i < 6; i++) {
      let position = Math.floor(Math.random() * letters.length);
      code = code + letters.charAt(position);
    }
    return code;
  }

}
