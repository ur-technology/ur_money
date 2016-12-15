import { ViewChild, Component } from '@angular/core';
import { Platform, Nav, MenuController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { HomePage } from '../pages/home/home';
import {ContactsAndChatsPage} from '../pages/contacts-and-chats/contacts-and-chats';
import {TransactionsPage} from '../pages/transactions/transactions';
import { AboutPage } from '../pages/about/about';
import {AuthService} from '../services/auth';
import {NoInternetConnectionPage} from '../pages/registration/no-internet-connection';
import {WelcomePage} from '../pages/registration/welcome';
import {IntroPage} from '../pages/registration/intro';
import {SettingsPage} from '../pages/settings/settings';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Config} from '../config/config'
import * as _ from 'lodash';
import * as log from 'loglevel';

@Component({
  templateUrl: 'app.html',
})
export class UrMoney {
  @ViewChild(Nav) nav: Nav;
  menuItems: any[];


  constructor(public platform: Platform,  public menu: MenuController, public auth: AuthService, public translate: TranslateService) {
    platform.ready().then(() => {
      StatusBar.styleDefault();
      Splashscreen.hide();
    });

    this.initializeApp();
    this.translateConfig();
    this.translateMenu();
  }

  storeReferralCodeIfPresent() {
    let params: string = window.location.search || '';
    let matches: string[] = params.match(/[\?\&]r\=([a-zA-Z0-9]+)/);
    if (matches && matches[1]) {
      window.localStorage.setItem('urMoneyReferralCode', matches[1]);
    }
  }

  initializeApp() {
    this.storeReferralCodeIfPresent();
    this.menuItems = [
      { title: 'Home', page: HomePage, icon: 'icon menu-icon menu-icon-home', value: 'home' },
      { title: 'Chat', page: ContactsAndChatsPage, pageParams: { goal: 'chat' }, icon: 'icon menu-icon menu-icon-chat', value: 'chat' },
      { title: 'Send UR', page: ContactsAndChatsPage, pageParams: { goal: 'send' }, icon: 'icon menu-icon menu-icon-send-ur', value: 'send' },
      // { title: 'Request UR', page: ContactsAndChatsPage, pageParams: { goal: 'request' }, icon: 'icon menu-icon menu-icon-request-ur', value: 'request' },
      { title: 'Transactions', page: TransactionsPage, icon: 'icon menu-icon menu-icon-transactions', value: 'transactions' },
      { title: 'About UR', page: AboutPage, icon: 'icon menu-icon menu-icon-about', value: 'about' }
    ];

    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        StatusBar.styleDefault();
      }
      if (this.platform.is('ios')) {
        let removed: any[] = _.remove(this.menuItems, (menu) => {
          return menu.value === 'send';
        });
        this.menuItems = _.pull(this.menuItems, removed);
      }

      let logLevel = { 'trace': 0, 'debug': 1, 'info': 2, 'warn': 3, 'error': 4, 'silent': 5 }[Config.logLevel] || 1;
      log.setDefaultLevel(logLevel);

      this.auth.respondToAuth(this.nav, {
        noInternetConnectionPage: NoInternetConnectionPage,
        welcomePage: WelcomePage,
        introPage: IntroPage,
        homePage: HomePage
      });

      log.info(`UrMoney initialized with firebaseProjectId ${Config.firebaseProjectId}`);
    });
  }

  translateMenu() {
    this.translate.get('app.home').subscribe((res: string) => {
      this.menuItems[_.findIndex(this.menuItems, ['value', 'home'])].title = res;
    });
    this.translate.get('app.chat').subscribe((res: string) => {
      this.menuItems[_.findIndex(this.menuItems, ['value', 'chat'])].title = res;
    });
    this.translate.get('app.sendUr').subscribe((res: string) => {
      let index = _.findIndex(this.menuItems, ['value', 'send']);
      if (index !== -1) {
        this.menuItems[index].title = res;
      }
    });
    this.translate.get('app.transactions').subscribe((res: string) => {
      this.menuItems[_.findIndex(this.menuItems, ['value', 'transactions'])].title = res;
    });
    this.translate.get('app.about').subscribe((res: string) => {
      this.menuItems[_.findIndex(this.menuItems, ['value', 'about'])].title = res;
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
      this.nav.push(menuItem.page, menuItem.pageParams || {}, { animate: true, direction: 'forward' });
    }
  }

  openSettings() {
    this.menu.close();
    this.nav.push(SettingsPage);
  }

  invite() {
    this.menu.close();
    this.nav.push(ContactsAndChatsPage, { goal: 'invite' }, { animate: true, direction: 'forward' });
  }

  hideSplashScreen() {
    if (Splashscreen) {
      setTimeout(() => {
        Splashscreen.hide();
      }, 100);
    }
  }
}
