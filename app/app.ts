import {ViewChild, Component, provide} from '@angular/core';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
import {Http, HTTP_PROVIDERS } from '@angular/http';
import {ionicBootstrap, Platform, MenuController, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {FIREBASE_PROVIDERS, defaultFirebase, firebaseAuthConfig, AuthProviders, AuthMethods} from 'angularfire2';
import {TranslateService, TranslatePipe, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
import * as _ from 'lodash';
import * as log from 'loglevel';

import {Config} from './config/config';
import {AuthService} from './services/auth';
import {ChartDataService} from './services/chart-data';
import {CountryListService} from './services/country-list';
import {ContactsService} from './services/contacts';
import {EncryptionService} from './services/encryption';
// import {DeviceIdentityService} from './services/device-identity';
import {Splashscreen} from 'ionic-native';
import {EventsService} from './services/events';
import {ToastService} from './services/toast';

import {ContactsAndChatsPage} from './pages/contacts-and-chats/contacts-and-chats';
import {InviteLinkPage} from './pages/invite-link/invite-link';
import {NoInternetConnectionPage} from './pages/registration/no-internet-connection';
import {WelcomePage} from './pages/registration/welcome';
import {IntroPage} from './pages/registration/intro';
import {HomePage} from './pages/home/home';
import {SendPage} from './pages/send/send';
import {AboutPage} from './pages/about/about';
import {SettingsPage} from './pages/settings/settings';
import {TransactionsPage} from './pages/transactions/transactions';

@Component({
  templateUrl: 'build/app.html',
  providers: [
    AuthService,
    // DeviceIdentityService,
    ContactsService,
    EncryptionService,
    EventsService,
    CountryListService,
    ChartDataService,
    ToastService,
    FIREBASE_PROVIDERS,
    HTTP_PROVIDERS,
    defaultFirebase({
      apiKey: Config.firebaseApiKey,
      authDomain: `${Config.firebaseProjectId}.firebaseapp.com`,
      databaseURL: `https://${Config.firebaseProjectId}.firebaseio.com`,
      storageBucket: `${Config.firebaseProjectId}.appspot.com`
    }),
    firebaseAuthConfig({
      provider: AuthProviders.Custom, method: AuthMethods.CustomToken, remember: 'default' // scope: ['email']
    })
  ],
  pipes: [TranslatePipe]
})
class UrMoney {
  @ViewChild(Nav) nav: Nav;
  menuItems: any[];

  constructor(private platform: Platform, private menu: MenuController, public auth: AuthService, private translate: TranslateService) {
    this.initializeApp();
    this.translateConfig();
    this.translateMenu();
  }

  initializeApp() {
    this.menuItems = [];
    this.menuItems.push({ title: 'Home', page: HomePage, icon: 'icon menu-icon menu-icon-home', value: 'home' });
    if (Config.targetPlatform !== 'web') {
      this.menuItems.push({ title: 'Chat', page: ContactsAndChatsPage, pageParams: { goal: 'chat' }, icon: 'icon menu-icon menu-icon-chat', value: 'chat' });
    }
    if (Config.targetPlatform === 'android') {
      this.menuItems.push({ title: 'Send UR', page: ContactsAndChatsPage, pageParams: { goal: 'send' }, icon: 'icon menu-icon menu-icon-send-ur', value: 'send' });
    } else if (Config.targetPlatform === 'web') {
      this.menuItems.push({ title: 'Send UR', page: SendPage, pageParams: { contact: {} }, icon: 'icon menu-icon menu-icon-send-ur', value: 'send' });
    }
    // this.menuItems.push({ title: 'Request UR', page: ContactsAndChatsPage, pageParams: { goal: 'request' }, icon: 'icon menu-icon menu-icon-request-ur', value: 'request' });
    this.menuItems.push({ title: 'Transactions', page: TransactionsPage, icon: 'icon menu-icon menu-icon-transactions', value: 'transactions' });
    this.menuItems.push({ title: 'About UR', page: AboutPage, icon: 'icon menu-icon menu-icon-about', value: 'about' });


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
      this.nav.push(menuItem.page, menuItem.pageParams || {}, { animate: true, direction: 'forward' });
    }
  }

  openSettings() {
    this.menu.close();
    this.nav.push(SettingsPage);
  }

  invite() {
    this.menu.close();
    if (Config.targetPlatform === 'web') {
      this.nav.push(InviteLinkPage, { animate: true, direction: 'forward' });
    } else {
      this.nav.push(ContactsAndChatsPage, { goal: 'invite' }, { animate: true, direction: 'forward' });
    }
  }

}

ionicBootstrap(UrMoney, [disableDeprecatedForms(),
  provideForms(), [provide(TranslateLoader, {
    useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
    deps: [Http]
  }),
    TranslateService]], {
    platforms: {
      ios: {
        statusbarPadding: true
      },
    }
  }
);
