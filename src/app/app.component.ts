import * as _ from 'lodash';
import * as log from 'loglevel';
import * as firebase from 'firebase';

import { ViewChild, Component } from '@angular/core';
import { Platform, Nav, MenuController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { Config } from '../config/config'

import { AuthService } from '../services/auth';
import { ContactsService } from '../services/contacts.service';
import { ToastService } from '../services/toast';
import { Utils } from '../services/utils';
import { GoogleAnalyticsEventsService } from '../services/google-analytics-events.service';

import { AboutPage } from '../pages/about/about';
import { ContactsAndChatsPage } from '../pages/contacts-and-chats/contacts-and-chats';
import { HomePage } from '../pages/home/home';
import { IdScanPage } from '../pages/registration/id-scan/id-scan';
import { InviteLinkPage } from '../pages/invite-link/invite-link';
import { ReferralsPage } from '../pages/referrals/referrals';
import { NoInternetConnectionPage } from '../pages/no-internet-connection/no-internet-connection';
import { ProfileSetupPage } from '../pages/registration/profile-setup/profile-setup';
import { ResetPasswordWithCodePage } from '../pages/registration/reset-password-with-code/reset-password-with-code';
import { SelfieMatchPage } from '../pages/registration/selfie-match/selfie-match';
import { SendPage } from '../pages/send/send';
import { SettingsPage } from '../pages/settings/settings/settings';
import { TransactionsPage } from '../pages/transactions/transactions';
import { UserPage } from '../pages/admin/user';
import { UsersPage } from '../pages/admin/users';
import { WelcomePage } from '../pages/registration/welcome/welcome';


@Component({
  templateUrl: 'app.html',
})
export class UrMoney {
  @ViewChild(Nav) nav: Nav;
  menuItems: any[];
  pageName = 'appComponent';


  constructor(
    public platform: Platform,
    public menu: MenuController,
    public auth: AuthService,
    public translate: TranslateService,
    public contactsService: ContactsService,
    public toastService: ToastService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    this.initializeApp();
    this.translateConfig();
  }

  private initializeApp() {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        StatusBar.styleDefault();
        if (Splashscreen) {
          setTimeout(() => {
            Splashscreen.hide();
          }, 100);
        }
      }

      let logLevel = { 'trace': 0, 'debug': 1, 'info': 2, 'warn': 3, 'error': 4, 'silent': 5 }[Config.logLevel] || 1;
      let params = Utils.queryParams();

      log.setDefaultLevel(logLevel);

      this.auth.respondToAuth((error) => {
        if (error) {
          if (error.messageKey === 'noInternetConnection') {
            this.nav.setRoot(NoInternetConnectionPage);
          } else {
            log.warn(`got error responding to authentication change: ${error}`);
          }
          return;
        }

        this.initializeMenu();

        // Verify email if verification code is present
        let verificationCode = params['verification-code'];
        if (verificationCode && this.auth && this.auth.currentUser && !this.auth.currentUser.isEmailVerified) {
          this.verifyEmail(verificationCode);
        }

        let status = this.auth.getUserStatus();
        if (status === 'unauthenticated') {
          let resetCode = params['reset-code'];

          if (resetCode) {
            this.nav.setRoot(ResetPasswordWithCodePage, { resetCode });
          } else {
            this.nav.setRoot(WelcomePage);
          }
        } else if (status === 'initial' || !this.auth.currentUser.wallet || !this.auth.currentUser.wallet.address) {

          if (this.auth.currentUser.selfieMatched) {

            if (!this.auth.currentUser.wallet || !this.auth.currentUser.wallet.address) {
              this.nav.setRoot(ProfileSetupPage);
            } else {
              this.nav.setRoot(HomePage);
            }
          } else if (this.auth.currentUser.idUploaded) {
            this.nav.setRoot(SelfieMatchPage);
          } else {
            this.nav.setRoot(IdScanPage);
          }
        } else {

          if (!this.auth.currentUser.idUploaded) {
            this.nav.setRoot(IdScanPage);
          } else if (!this.auth.currentUser.selfieMatched) {
            this.nav.setRoot(SelfieMatchPage);
          } else if (this.auth.currentUser.admin && params['admin-redirect']) {

            switch (params['redirect']) {

              case 'user':
                this.lookupUserById(params['id']).then((user) => {
                  this.nav.setRoot(UserPage, { user: user });
                });

              default:
                this.nav.setRoot(HomePage);
            }

          } else {
            this.contactsService.loadContacts(this.auth.currentUserId, this.auth.currentUser.phone, this.auth.currentUser.countryCode);
            this.nav.setRoot(HomePage);
          }
        }
      });

      log.info(`UrMoney initialized with firebaseProjectId ${Config.firebaseProjectId}`);
    });
  }

  lookupUserById(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let userRef = firebase.database().ref(`/users/${userId}`);
      userRef.once('value', (snapshot: firebase.database.DataSnapshot) => {
        let user: any = snapshot.val();
        if (user) {
          user.userId = userId;
          resolve(user);
        } else {
          let error = `no user exists at location ${userRef.toString()}`
          log.warn('  ' + error);
          reject(error);
        }
      });
    });
  }

  private initializeMenu() {
    this.menuItems = [];
    if (this.auth.currentUser) {
      this.menuItems.push({ title: 'Home', page: HomePage, icon: 'icon menu-icon menu-icon-home', value: 'home' });
      if (Config.targetPlatform !== 'web') {
        this.menuItems.push({ title: 'Chat', page: ContactsAndChatsPage, pageParams: { goal: 'chat' }, icon: 'icon menu-icon menu-icon-chat', value: 'chat' });
      }

      this.menuItems.push({ title: 'Send UR', page: SendPage, pageParams: { contact: {} }, icon: 'icon menu-icon menu-icon-send-ur', value: 'send' });
      this.menuItems.push({ title: 'Transactions', page: TransactionsPage, icon: 'icon menu-icon menu-icon-transactions', value: 'transactions' });
      if (this.auth.announcementConfirmed()) {
        this.menuItems.push({ title: 'Invite friends', page: Config.targetPlatform === 'web' ? InviteLinkPage : ContactsAndChatsPage, pageParams: { goal: 'invite' }, icon: 'icon menu-icon menu-icon-invite', value: 'inviteFriends' });
      }
    }
    this.menuItems.push({ title: 'Referrals', page: ReferralsPage, icon: 'icon menu-icon menu-icon-transactions', value: 'referrals' });
    if (this.auth.currentUser && this.auth.currentUser.admin) {
      this.menuItems.push({ title: 'Manage Users', page: UsersPage, icon: 'icon menu-icon menu-icon-people', value: 'users' });
    }
    this.menuItems.push({ title: 'About UR', page: AboutPage, icon: 'icon menu-icon menu-icon-about', value: 'about' });

    this.translateMenu();
  }

  private translateMenu() {
    _.each(this.menuItems, (menuItem) => {
      this.translate.get(`app.${menuItem.value}`).subscribe((res: string) => {
        menuItem.title = res;
      });
    });
  }

  translateConfig() {
    var userLang = navigator.language.split('-')[0]; // use navigator lang if available
    userLang = /(de|en|es)/gi.test(userLang) ? userLang : 'en';
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translate.setDefaultLang('en');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use(userLang);
  }

  openPage(menuItem) {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, `Clicked side menu - ${menuItem.title}`, 'openPage()');
    this.menu.close();
    if (menuItem.page === HomePage) {
      this.nav.setRoot(HomePage, {}, { animate: true, direction: 'back' });
    } else {
      this.nav.push(menuItem.page, menuItem.pageParams || {});
    }
  }

  openSettings() {
    this.menu.close();
    this.nav.push(SettingsPage);
  }

  invite() {
    this.menu.close();
    if (Config.targetPlatform === 'web') {
      this.nav.push(InviteLinkPage);
    } else {
      this.nav.push(ContactsAndChatsPage, { goal: 'invite' });
    }
  }

  envModeDisplay() {
    return Utils.envModeDisplay();
  }

  private verifyEmail(verificationCode: string) {
    this.auth
      .verifyEmail(verificationCode)
      .then((taskState: string) => {
        switch (taskState) {
          case 'verify_email_finished':
            this.toastService.showMessage({ messageKey: 'verify-email.emailVerified' });
            break;

          case 'verify_email_canceled_because_user_not_found':
            this.toastService.showMessage({ messageKey: 'verify-email.verificationCodeNotFound' });
            break;

          case 'verify_email_canceled_because_user_disabled':
            this.toastService.showMessage({ messageKey: 'errors.userDisabled' });
            break;

          default:
            this.toastService.showMessage({ messageKey: 'errors.unexpectedProblem' });
        }
      });
  }
}
