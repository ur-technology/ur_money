import { ViewChild, Component } from '@angular/core';
import { Platform, Nav, MenuController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { HomePage } from '../pages/home/home';
import {ContactsAndChatsPage} from '../pages/contacts-and-chats/contacts-and-chats';
import {TransactionsPage} from '../pages/transactions/transactions';
import { AboutPage } from '../pages/about/about';
import {AuthService} from '../services/auth';
import {ContactsService} from '../services/contacts';
import {Config} from '../config/config'
import {NoInternetConnectionPage} from '../pages/no-internet-connection/no-internet-connection';
import {WelcomePage} from '../pages/registration/welcome/welcome';
import {SendPage} from '../pages/send/send';
import {InviteLinkPage} from '../pages/invite-link/invite-link';
import {UsersPage} from '../pages/admin/users';
import {SettingsPage} from '../pages/settings/settings';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {ProfileSetupPage} from '../pages/registration/profile-setup/profile-setup';
import * as _ from 'lodash';
import * as log from 'loglevel';

@Component({
  templateUrl: 'app.html',
})
export class UrMoney {
  @ViewChild(Nav) nav: Nav;
  menuItems: any[];


  constructor(
    public platform: Platform,
    public menu: MenuController,
    public auth: AuthService,
    public translate: TranslateService,
    public contactsService: ContactsService
  ) {
    this.initializeApp();
    this.translateConfig();
  }

  private initializeApp() {
    this.saveSponsorReferralCodeIfPresent();

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

        let status = this.auth.getUserStatus();
        if (status === 'unauthenticated') {
          this.nav.setRoot(WelcomePage);
        } else if (status === 'initial' || !this.auth.currentUser.wallet || !this.auth.currentUser.wallet.address) {
          this.nav.setRoot(ProfileSetupPage);
        } else {
          this.contactsService.loadContacts(this.auth.currentUserId, this.auth.currentUser.phone, this.auth.currentUser.countryCode);
          this.nav.setRoot(HomePage);
        }
      });

      log.info(`UrMoney initialized with firebaseProjectId ${Config.firebaseProjectId}`);
    });
  }

  private saveSponsorReferralCodeIfPresent() {
    let pathname: string = window.location.pathname || '';
    let matches: string[] = pathname.match(/\/r\/([a-zA-Z0-9]+)/);
    if (!matches || !matches[1]) {
      let params: string = window.location.search || '';
      matches = params.match(/[\?\&]r\=([a-zA-Z0-9]+)/);
    }
    if (matches && matches[1]) {
      this.auth.sponsorReferralCode = matches[1];
    }
  }

  private initializeMenu() {
    this.menuItems = [];
    if (this.auth.currentUser) {
      this.menuItems.push({ title: 'Home', page: HomePage, icon: 'icon menu-icon menu-icon-home', value: 'home' });
      if (Config.targetPlatform !== 'web') {
        this.menuItems.push({ title: 'Chat', page: ContactsAndChatsPage, pageParams: { goal: 'chat' }, icon: 'icon menu-icon menu-icon-chat', value: 'chat' });
      }

      this.menuItems.push({ title: 'Send UR', page: SendPage, pageParams: { contact: {} }, icon: 'icon menu-icon menu-icon-send-ur', value: 'send' });

      // this.menuItems.push({ title: 'Request UR', page: ContactsAndChatsPage, pageParams: { goal: 'request' }, icon: 'icon menu-icon menu-icon-request-ur', value: 'request' });
      this.menuItems.push({ title: 'Transactions', page: TransactionsPage, icon: 'icon menu-icon menu-icon-transactions', value: 'transactions' });
    }
    this.menuItems.push({ title: 'About UR', page: AboutPage, icon: 'icon menu-icon menu-icon-about', value: 'about' });
    if (this.auth.currentUser && this.auth.currentUser.admin) {
      this.menuItems.push({ title: 'Manage Users', page: UsersPage, icon: 'icon menu-icon menu-icon-people', value: 'users' });
    }
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
}
