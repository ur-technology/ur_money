import { NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { AuthService } from '../../services/auth';
import { Config } from '../../config/config';
import { Component } from '@angular/core';
import { SocialSharing, Clipboard, Toast } from 'ionic-native';
import * as log from 'loglevel';
import { ChatPage } from '../../pages/chat/chat';
import { Utils } from '../../services/utils';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

declare var jQuery: any;

@Component({
  selector: 'contacts-and-chats-page',
  templateUrl: 'contacts-and-chats.html',
})
export class ContactsAndChatsPage {
  goal: any;
  segmentSelected: string = 'contacts';
  targetPlatform = Config.targetPlatform;
  pageName = 'ContactsAndChatsPage';

  constructor(public nav: NavController, public navParams: NavParams, public platform: Platform, public auth: AuthService, public alertCtrl: AlertController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    this.goal = navParams.get('goal');
    if (this.targetPlatform === 'web') {
      this.segmentSelected = 'chats';
    }
  }

  ngOnInit() {
    jQuery('.contentPage').css('top', this.targetPlatform === 'ios' ? '63px' : '43px');
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  goalChanged(data) {
    this.goal = data.goal;
  }

  onContactSelected(data) {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Chose contact. Go to chat page', 'onContactSelected()');
    let contact = data.contact;
    self.nav.pop({ animate: false, duration: 0, progressAnimation: false }).then(data => {
      self.nav.push(ChatPage, { contact: contact });
    });
  }


  getPageTitle() {
    switch (this.goal) {
      case 'chat':
        return "Chat with";
      case 'send':
        return "Send UR to";
      case 'request':
        return "Request UR from";
      case 'invite':
        return "Invite a friend";
    }
  }

  shareLink() {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Click on share button page', 'shareLink()');

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

}
