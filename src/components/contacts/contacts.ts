import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { SocialSharing, Clipboard, Toast } from 'ionic-native';
import { ContactsService } from '../../services/contacts.service';
import { AuthService } from '../../services/auth';
import { App } from 'ionic-angular';
import * as _ from 'lodash';
import { FirebaseApp } from 'angularfire2';
import * as log from 'loglevel';
import { TranslateService } from 'ng2-translate/ng2-translate';
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
    public app: App, public translate: TranslateService, @Inject(FirebaseApp) firebase: any
  ) {
    this.startTime = (new Date()).getTime();
  }

  private determineMemberActionLabel() {
    if (this.goal === 'send') {
      return this.translate.instant('contacts.select');
    } else if (this.goal === 'request') {
      return this.translate.instant('contacts.requestUr');
    } else {
      return this.translate.instant('contacts.chat');
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
        title: self.translate.instant('contacts.invitesDisabled'),
        message: self.translate.instant('contacts.sorryInvitesDisabled'),
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
    let message = this.translate.instant('contacts.inviteMessage');
    Clipboard.copy(message).then((data) => {
      Toast.show(this.translate.instant('contacts.toastMessage'), 'long', 'top').subscribe((toast) => {
        SocialSharing.shareWithOptions({
          message: message, // not supported on some apps (Facebook, Instagram)
          // file: 'https://ur.technology/wp-content/uploads/2016/11/icon-android-192x192.png',
          url: self.auth.referralLink(window),
          chooserTitle: this.translate.instant('contacts.toastTitle') // Android only
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
    return this.displayableContacts ? this.translate.instant('contacts.messageContactNotPresent') : this.translate.instant('contacts.messageNoContacts');
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
