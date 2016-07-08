import {Page, NavController, Platform, Alert, Toast} from 'ionic-angular';
import {HomePage} from '../home/home';
import {InviteContactsPage} from '../invite-contacts/invite-contacts';

// Native Plugins
import {SocialSharing} from 'ionic-native';
import {Clipboard} from 'ionic-native';
declare var window: any;

@Page({
  templateUrl: 'build/pages/invite/invite.html',
})
export class InvitePage {
  inviteConstant: any = {};
  downloadUrl: string = 'http://ur-money-staging.com/';
  constructor(public nav: NavController, public platform: Platform) {
    let runningPlatform = this.platform.is('android') ? 'android' : 'ios';
    this.inviteConstant = {
      sms: {
        messageText: `Check out UR Money for your smartphone. Download it today from ${this.downloadUrl}`
      },
      email: {
        subject: 'UR Money: Android + iPhone + Windows Phone',
        body: `Hey, \n I just downloaded UR Money ${runningPlatform}. 
        \n It is a app used to get hold of your money. \n 
        UR Money is good app new app use this as wallet \n \n
        Get it now form ${this.downloadUrl}`
      },
      facebook: {
        messageText: `Check out UR Money for your smartphone. Download it today from ${this.downloadUrl}`
      },
      twitter: {
        messageText: `Check out UR Money for your smartphone. Download it today from ${this.downloadUrl}`
      },
      whatsapp: {
        messageText: `Check out UR Money for your smartphone. Download it today from ${this.downloadUrl}`
      },
      clipboard: {
        messageText: `Check out UR Money for your smartphone. Download it today from ${this.downloadUrl}`
      }
    };
  }

  goBack() {
    this.nav.setRoot(HomePage, {}, { animate: true, direction: 'forward' });
  }
  goContact(inviteType, inviteData) {
    this.nav.push(InviteContactsPage, { inviteType: inviteType, inviteData: inviteData }, { animate: true, direction: 'forward' });
  }

  inviteWhatsApp() {
    this.platform.ready().then(() => {
      if (window.plugins.socialsharing) {
        window.plugins.socialsharing.canShareVia('whatsapp', this.inviteConstant.whatsapp.messageText, null, null, null, (result) => {
          window.plugins.socialsharing.shareViaWhatsApp(this.inviteConstant.whatsapp.messageText, null /* img */, null /* url */, (data) => {
            console.log(data);
          });
        }, (error) => {
          console.log(error);
          this.doErrorAlert('whatsapp');
        });
      }
    });
  }

  inviteFacebook() {
    this.platform.ready().then(() => {
      if (window.plugins.socialsharing) {
        window.plugins.socialsharing.shareViaFacebook(this.inviteConstant.facebook.messageText, null /* img */, null /* url */, (data) => {
          console.log(data);
        }, (error) => {
          console.log(error);
          this.doErrorAlert('facebook');
        });
      }
    });
  }

  inviteTwitter() {
    this.platform.ready().then(() => {
      if (window.plugins.socialsharing) {
        window.plugins.socialsharing.canShareVia('twitter', this.inviteConstant.twitter.messageText, null, null, null, (result) => {
          window.plugins.socialsharing.shareViaTwitter(this.inviteConstant.twitter.messageText, null /* img */, null /* url */, (data) => {
            console.log(data);
          });
        }, (error) => {
          console.log(error);
          this.doErrorAlert('twitter');
        });
      }
    });
  }

  copyToClipboard() {
    Clipboard.copy(this.inviteConstant.clipboard.messageText).then((data) => {
      let toast = Toast.create({
        message: 'Text copied to clipboard. Now you can open any app and simple paste',
        duration: 2000,
        position: 'middle'
      });
      this.nav.present(toast);
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
