import { NavController, NavParams, Platform, AlertController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {AuthService} from '../../services/auth';
import {Config} from '../../config/config';
import { Component } from '@angular/core';
import {SocialSharing, Clipboard, Toast} from 'ionic-native';
import * as log from 'loglevel';

declare var jQuery: any;

@Component({
  templateUrl: 'contacts-and-chats.html',
})
export class ContactsAndChatsPage {
  contactsPage: any;
  goal: any;
  chatsPage: any;
  segmentSelected: string = 'contacts';

  constructor(public nav: NavController, public navParams: NavParams, public platform: Platform, public translate: TranslateService, public auth: AuthService, public alertCtrl: AlertController) {
    this.goal = navParams.get('goal');
  }

  ngOnInit() {
    jQuery('.contentPage').css('top', Config.targetPlatform === 'ios' ? '63px' : '43px');
  }

  goalChanged(data) {
    this.goal = data.goal;
  }

  getPageTitle() {
    switch (this.goal) {
      case 'chat':
        return this.translate.instant('contacts-and-chats.titleChat');
      case 'send':
        return this.translate.instant('contacts-and-chats.titleSend');
      case 'request':
        return this.translate.instant('contacts-and-chats.titleRequest');
      case 'invite':
        return this.translate.instant('contacts-and-chats.titleInvite');
    }
  }

  shareLink() {
    let self = this;

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

}
