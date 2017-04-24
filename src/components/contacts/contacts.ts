import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { SocialSharing, Clipboard, Toast } from 'ionic-native';
import { ContactsService } from '../../services/contacts.service';
import { AuthService } from '../../services/auth';
import { App } from 'ionic-angular';
import * as _ from 'lodash';
import * as log from 'loglevel';
import { Utils } from '../../services/utils';
declare var window: any;

@Component({
  templateUrl: 'contacts.html',
  selector: 'contacts',
})
export class ContactsComponent {
  pageIndex = 0;
  numberOfPages = 0;
  PAGE_SIZE = 15;
  paginatedContacts: any[] = [];
  displayableContacts: any[];
  contacts: any[];
  startTime: number;
  showSpinner: boolean = true;
  @Input() goal: string;
  @Output() goalChange: EventEmitter<any> = new EventEmitter();
  @Output() onContactSelected: EventEmitter<any> = new EventEmitter();
  public memberActionLabel: string;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public contactsService: ContactsService,
    public auth: AuthService,
    public platform: Platform,
    public alertCtrl: AlertController,
    public app: App
  ) {
    this.startTime = (new Date()).getTime();
  }

  private determineMemberActionLabel() {
    if (this.goal === 'send') {
      return "Select";
    } else if (this.goal === 'request') {
      return "Request UR";
    } else {
      return "Chat";
    }
  }

  ngAfterViewInit() {
    this.loadContactsList();
  }

  loadContactsList() {
    let self = this;
    this.memberActionLabel = this.determineMemberActionLabel();
    self.contactsService.getContacts().then((contactGroups: any) => {
      self.contacts = self.goal === 'invite' ? contactGroups.nonMembers : contactGroups.members;
      this.fillContactFilterArrays(self.contacts);
      this.showSpinner = false;
    });
  }

  fillContactFilterArrays(contacts) {
    this.paginatedContacts = _.chunk(contacts, this.PAGE_SIZE);
    this.numberOfPages = this.paginatedContacts.length;
    this.displayableContacts = this.paginatedContacts[0];
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
    if (!contact.userId) {
      this.inviteContact(contact);
    } else {
      this.informContactSelected(contact);
    }
  }

  informContactSelected(contact: any) {
    this.onContactSelected.emit({ contact: contact });
  }

  inviteContact(contact: any) {
    let self = this;
    if (self.auth.currentUser.invitesDisabled) {
      self.alertCtrl.create({
        title: "Invites Disabled",
        message: "Sorry, invites are disabled for this account.",
        buttons: ['Ok']
      }).present();
      return;
    }

    if (!self.platform.is('cordova')) {
      // HACK: this code is here to test invitations in ionic serve
      self.alertCtrl.create({
        title: 'Simulating social sharing action sheet',
        message: 'This is where the social sharing action sheet is normally displayed!',
        buttons: ['Ok']
      }).present();
      return;
    }
    let message = "I downloaded the UR money app and got 2,000 units of cryptocurrency for free. To learn more and get yours free too, visit ";
    Clipboard.copy(message).then((data) => {
      Toast.show("Pick an app and type a message. Or you can paste the simple message that we've placed in your clipboard.", 'long', 'top').subscribe((toast) => {
        SocialSharing.shareWithOptions({
          message: message, // not supported on some apps (Facebook, Instagram)
          // file: 'https://ur.technology/wp-content/uploads/2016/11/icon-android-192x192.png',
          url: Utils.referralLink(self.auth.currentUser.referralCode),
          chooserTitle: "Pick an app" // Android only
        }).then((result) => {
          log.debug('returned from SocialSharing.shareWithOptions');
        }, (error) => {
          log.warn('Sharing failed with message: ' + error);
        });
      });
    });
  }

  inviteFriend() {
    this.goal = 'invite';
    this.goalChange.emit({ goal: this.goal });
    this.loadContactsList();
  }

  getInviteItemMessage() {
    return this.displayableContacts ? "Contact not in list? Invite a friend" : "It looks like you don't have contacts yet. Invite a friend";
  }

  filterItems(ev) {
    let val = ev.target.value;
    let tempContacts: any[] = this.contacts;
    if (val && val.trim() !== '') {
      tempContacts = _.filter(tempContacts, contact => {
        return contact.name.toLowerCase().indexOf(val.toLowerCase()) !== -1;
      });
    }
    this.fillContactFilterArrays(tempContacts);
  }
}
