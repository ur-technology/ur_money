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
import {NoInternetConnectionPage} from './pages/registration/no-internet-connection';
import {WelcomePage} from './pages/registration/welcome';
import {IntroPage} from './pages/registration/intro';
import {HomePage} from './pages/home/home';
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
      this.hideSplashScreen();

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
