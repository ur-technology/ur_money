import { Component } from '@angular/core';
import {NavController, NavParams, ActionSheet} from 'ionic-angular';
import {SocialSharing} from 'ionic-native';
import {ContactsService} from '../../components/services/contacts-service';
import {Auth} from '../../components/auth/auth';
import {ChatPage} from '../chat/chat';
import {Invite} from '../../components/models/invite';
import {Config} from '../../components/config/config';
import * as _ from 'lodash';
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
    private auth: Auth) {
    this.startTime = (new Date()).getTime();
    this.nonMembersFirst = navParams.get("nonMembersFirst")
  }

  ionViewDidEnter() {
    this.contactsService.load(this.auth.countryCode, this.auth.currentUserId).then((contactGroups: any) => {
      let contacts = this.nonMembersFirst ? contactGroups.nonMembers.concat(contactGroups.members) : contactGroups.members.concat(contactGroups.nonMembers);
      this.paginatedContacts = _.chunk(contacts, this.PAGE_SIZE);
      this.numberOfPages = this.paginatedContacts.length;
      this.displayableContacts = this.paginatedContacts[0];
      let timeElapsed = (new Date()).getTime() - this.startTime;
      console.log("milliseconds elapsed", timeElapsed);
      console.log("contactGroups.nonMembers.length", contactGroups.nonMembers.length);
      console.log("contactGroups.members.length", contactGroups.members.length);
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
      this.displayInviteActionSheet(contact);
    }
  }

  displayInviteActionSheet(contact: any) {
    let invite = new Invite('/invitations', {inviterUserId: this.auth.currentUserId, contact: contact});
    SocialSharing.shareWithOptions({
      message: `I downloaded the UR money app and got 2,000 units of cryptocurrency for free. To learn more and get yours free too, visit `, // not supported on some apps (Facebook, Instagram)
      subject: 'I downloaded the UR money app and got cryptocurrency for free', // for email only
      // files: ['', ''], // an array of filenames either locally or remotely
      url: `${Config.values().appDownloadUrl}/${invite.inviteCode}`,
      chooserTitle: 'Pick an app' // Android only
    }).then((result) => {
      invite.save();
    },
    (error) => {
      console.log("Sharing failed with message: " + error);
    });
  }

}
