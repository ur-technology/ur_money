import {Page, NavController, Platform, Alert, Toast} from 'ionic-angular';
import {HomePage} from '../home/home';
import {InviteContactsPage} from '../invite-contacts/invite-contacts';
import {InviteService} from '../../components/services/invite.service';
import {Auth} from '../../components/auth/auth';

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
  constructor(public nav: NavController, public platform: Platform, public inviteService: InviteService, public auth: Auth) {
    let runningPlatform = this.platform.is('android') ? 'android' : 'ios';
    this.inviteConstant = {
      sms: {
        messageText: `Check out UR Money for your smartphone`
      },
      email: {
        subject: 'UR Money: Android + iPhone + Windows Phone',
        body: `Hey, \n I just downloaded UR Money ${runningPlatform}. 
        \n It is a app used to get hold of your money. \n 
        UR Money is good app new app use this as wallet \n \n`

      },
      facebook: {
        messageText: `Check out UR Money for your smartphone`,
        imageUrl: 'https://ur-money-staging.firebaseapp.com/img/logo.png'
      },
      twitter: {
        messageText: `Check out UR Money for your smartphone`
      },
      whatsapp: {
        messageText: `Check out UR Money for your smartphone`
      },
      clipboard: {
        messageText: `Check out UR Money for your smartphone`
      }
    };
  }

  goBack() {
    this.nav.setRoot(HomePage, {}, { animate: true, direction: 'forward' });
  }
  goContact(inviteType, inviteData) {
    if (inviteType === 'email') {
      inviteData.body = this.shareText(inviteData.body);
    } else {
      inviteData.shareText = this.shareText(inviteData.messageText);
    }
    this.nav.push(InviteContactsPage, { inviteType: inviteType, inviteData: inviteData }, { animate: true, direction: 'forward' });
  }

  inviteWhatsApp() {
    let shareText = this.shareText(this.inviteConstant.whatsapp.messageText);

    this.platform.ready().then(() => {
      if (window.plugins.socialsharing) {
        window.plugins.socialsharing.canShareVia('whatsapp', shareText, null, null, null, (result) => {
          window.plugins.socialsharing.shareViaWhatsApp(shareText, null /* img */, null /* url */, (data) => {
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
      if (window.facebookConnectPlugin) {
        window.facebookConnectPlugin.showDialog({
          method: 'send',
          caption: this.shareText(this.inviteConstant.facebook.messageText),
          link: 'https://ur-money-staging.firebaseapp.com/img/logo.png',
          picture: 'https://ur-money-staging.firebaseapp.com/img/logo.png'
        }, (data) => {
          console.log(data);
        }, (error) => {
          console.log(error);
          this.doErrorAlert('facebook messenger');
        });
      }
    });
  }

  inviteTwitter() {
    let shareText = this.shareText(this.inviteConstant.whatsapp.messageText);
    this.platform.ready().then(() => {
      if (window.plugins.socialsharing) {
        let app = this.platform.is('android') ? 'twitter' : 'com.apple.social.twitter';
        window.plugins.socialsharing.canShareVia(app, shareText, null, null, null, (result) => {
          window.plugins.socialsharing.shareViaTwitter(shareText, null /* img */, null /* url */, (data) => {
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
    Clipboard.copy(this.shareText(this.inviteConstant.clipboard.messageText)).then((data) => {
      let toast = Toast.create({
        message: 'Text copied to clipboard. Now you can open any app and simple paste',
        duration: 2000,
        position: 'middle'
      });
      this.nav.present(toast);
    });
  }

  createInviteCode() {
    return this.inviteService.createInvite(this.auth.uid);
  }

  shareText(inviteText: string) {
    return `${inviteText}. Use invite code ${this.createInviteCode()}. Get it now form ${this.downloadUrl}`;
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
