import { NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AuthService } from '../../services/auth';
import { Config } from '../../config/config';
import { Component } from '@angular/core';
import { SocialSharing, Clipboard, Toast } from 'ionic-native';
import * as log from 'loglevel';
import { ChatPage } from '../../pages/chat/chat';

declare var jQuery: any;

@Component({
  selector: 'contacts-and-chats-page',
  templateUrl: 'contacts-and-chats.html',
})
export class ContactsAndChatsPage {
  goal: any;
  segmentSelected: string = 'contacts';
  targetPlatform = Config.targetPlatform;

  constructor(public nav: NavController, public navParams: NavParams, public platform: Platform, public translate: TranslateService, public auth: AuthService, public alertCtrl: AlertController) {
    this.goal = navParams.get('goal');
    if (this.targetPlatform === 'web') {
      this.segmentSelected = 'chats';
    }
  }

  ngOnInit() {
    jQuery('.contentPage').css('top', this.targetPlatform === 'ios' ? '63px' : '43px');
  }

  goalChanged(data) {
    this.goal = data.goal;
  }

  onContactSelected(data) {
    let self = this;
    let contact = data.contact;
    self.nav.pop({ animate: false, duration: 0, progressAnimation: false }).then(data => {
      self.nav.push(ChatPage, { contact: contact });
    });
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
