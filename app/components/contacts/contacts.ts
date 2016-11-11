import { Component, Input, Output, EventEmitter } from '@angular/core';
import {NavController, NavParams, Platform, AlertController} from 'ionic-angular';
import {SocialSharing, Clipboard, Toast} from 'ionic-native';
import {ContactsService} from '../../services/contacts';
import {AuthService} from '../../services/auth';
import {SendPage} from '../../pages/send/send';
import {RequestPage} from '../../pages/request/request';
import {ChatPage} from '../../pages/chat/chat';
import { App } from 'ionic-angular';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
declare var window: any;

@Component({
  templateUrl: 'build/components/contacts/contacts.html',
  selector: 'contacts',
  pipes: [TranslatePipe]
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
  public memberActionLabel: string;

  constructor(
    private nav: NavController,
    private navParams: NavParams,
    private contactsService: ContactsService,
    private auth: AuthService,
    private platform: Platform,
    private alertCtrl: AlertController,
    private app: App, private translate: TranslateService
  ) {
    this.startTime = (new Date()).getTime();

  }

  private determineMemberActionLabel() {
    if (this.goal === 'send') {
      return this.translate.instant('contacts.sendUr');
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
    } else if (this.goal === 'send') {
      this.nav.pop({ animate: false, duration: 0, transitionDelay: 0, progressAnimation: false }).then(data => {
        this.app.getRootNav().push(SendPage, { contact: contact });
      });
    } else if (this.goal === 'request') {
      this.nav.pop({ animate: false, duration: 0, transitionDelay: 0, progressAnimation: false }).then(data => {
        this.app.getRootNav().push(RequestPage, { contact: contact });
      });
    } else {
      this.nav.pop({ animate: false, duration: 0, transitionDelay: 0, progressAnimation: false }).then(data => {
        this.app.getRootNav().push(ChatPage, { contact: contact });
      });
    }
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

    let invitationCode = self.generateInvitationCode();
    if (!self.platform.is('cordova')) {
      // HACK: this code is here to test invitations in ionic serve
      let alert = self.alertCtrl.create({ title: 'Simulating social sharing action sheet', message: 'Invitation added to queue!', buttons: ['Ok'] });
      alert.present();
      self.addNewInvitationToQueue(contact, invitationCode);
      return;
    }
    let message = this.translate.instant('contacts.inviteMessage');
    Clipboard.copy(message).then((data) => {
      Toast.show(this.translate.instant('contacts.toastMessage'), 'long', 'top').subscribe((toast) => {
        SocialSharing.shareWithOptions({
          message: message, // not supported on some apps (Facebook, Instagram)
          file: 'https://ur-money-staging.firebaseapp.com/img/icon.png',
          url: 'https://www.ur.international',
          chooserTitle: this.translate.instant('contacts.toastTitle') // Android only
        }).then((result) => {
          log.debug('returned from SocialSharing.shareWithOptions; saving dowlineUser');
          self.addNewInvitationToQueue(contact, invitationCode);
        }, (error) => {
          log.warn('Sharing failed with message: ' + error);
        });
      });
    });
  }

  private addNewInvitationToQueue(contact, invitationCode) {
    firebase.database().ref('/invitationQueue/tasks').push({
      sponsorUserId: this.auth.currentUserId,
      invitee: {
        firstName: contact.original.firstName,
        middleName: contact.original.middleName || '',
        lastName: contact.original.lastName,
        phone: contact.phone,
        invitationCode: invitationCode
      }
    });
  }

  private generateInvitationCode(): string {
    let code: string = '';
    let letters = 'ABCDEFGHKMNPRSTWXYZ2345689';
    for (var i = 0; i < 6; i++) {
      let position = Math.floor(Math.random() * letters.length);
      code = code + letters.charAt(position);
    }
    return code;
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
