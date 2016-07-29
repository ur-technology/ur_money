import {ViewChild, Component, Type} from '@angular/core';
import {HTTP_PROVIDERS } from '@angular/http';
import {ionicBootstrap, Platform, MenuController, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {FIREBASE_PROVIDERS, defaultFirebase, firebaseAuthConfig, AuthProviders, AuthMethods} from 'angularfire2';
import * as _ from 'lodash';
import * as log from 'loglevel';

import {Auth} from './services/auth';
import {ChartData} from './services/chart-data';
import {TransactionNavService} from './pages/transactions/transaction-nav-service';
import {CountryListService} from './services/country-list-service';
import {LoadingModal} from './components/loading-modal/loading-modal';
import {ContactsService} from './services/contacts-service';
import {DeviceIdentityService} from './services/device-identity-service';
import {Config} from './services/config'; // TODO: make this injectable

import {ContactsAndChatsPage} from './pages/contacts-and-chats/contacts-and-chats';
import {Registration1Page} from './pages/registration/registration1';
import {Registration4Page} from './pages/registration/registration4';
import {HomePage} from './pages/home/home';
import {SendPage} from './pages/send/send';
import {ReceivePage} from './pages/receive/receive';
import {ContactsPage} from './pages/contacts/contacts';
import {AboutPage} from './pages/about/about';
import {SettingsPage} from './pages/settings/settings';
import {TransactionsPage} from './pages/transactions/transactions';
import {DownloadPage} from './pages/download/download';

@Component({
  templateUrl: 'build/app.html',
  directives: [LoadingModal],
  providers: [
    Auth,
    DeviceIdentityService,
    ContactsService,
    TransactionNavService,
    CountryListService,
    ChartData,
    LoadingModal,
    FIREBASE_PROVIDERS,
    HTTP_PROVIDERS,
    defaultFirebase(Config.values().firebase),
    firebaseAuthConfig({
      provider: AuthProviders.Custom, method: AuthMethods.CustomToken, remember: 'default' // scope: ['email']
    })
  ]
})
class UrMoney {
  @ViewChild(Nav) nav: Nav;

  // rootPage: any = Registration1Page;
  menuItems: Array<{ title: string, component: any, icon: string }>;
  user: any = {};
  invitePage: any;
  faceUrl: string;
  constructor(private platform: Platform, private menu: MenuController, public auth: Auth) {
    this.initializeApp();

    this.menuItems = [
      { title: 'Home', component: HomePage, icon: 'icon menu-icon menu-icon-home' },
      { title: 'Chat', component: ContactsAndChatsPage, icon: 'icon menu-icon menu-icon-chat' },
      { title: 'Send UR', component: SendPage, icon: 'icon menu-icon menu-icon-send-ur' },
      { title: 'Request UR', component: ReceivePage, icon: 'icon menu-icon menu-icon-request-ur' },
      { title: 'Transactions', component: TransactionsPage, icon: 'icon menu-icon menu-icon-transactions' },
      { title: 'About UR', component: AboutPage, icon: 'icon menu-icon menu-icon-about' }
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {

      if (this.platform.is('cordova')) {
        StatusBar.styleDefault();
      }

      log.setDefaultLevel(1); // { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3, "ERROR": 4, "SILENT": 5 }
      log.info("starting app")

      if (/^\/app/.test(window.location.pathname)) {
        this.nav.setRoot(DownloadPage, {}, { animate: true, direction: 'forward' });
        return;
      }

      this.auth.respondToAuth(this.nav, Registration1Page, Registration4Page, HomePage);

    });
  }

  openPage(page) {
    this.menu.close();
    if (page.component == HomePage) {
      this.nav.setRoot(HomePage, {}, { animate: true, direction: 'back' });
    } else {
      this.nav.rootNav.push(page.component, {}, { animate: true, direction: 'forward' });
    }
  }

  openSettings() {
    this.menu.close();
    this.nav.rootNav.push(SettingsPage);
  }

  inviteContact() {
    this.menu.close();
    this.nav.rootNav.push(ContactsAndChatsPage, {nonMembersFirst: true}, { animate: true, direction: 'forward' });
  }

}
// Pass the main App component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument, see the docs for
// more ways to configure your app:
// http://ionicframework.com/docs/v2/api/config/Config/
// Place the tabs on the bottom for all platforms
// See the theming docs for the default values:
// http://ionicframework.com/docs/v2/theming/platform-specific-styles/

ionicBootstrap(UrMoney, [], {
  mode: 'ios',
  platforms: {
    ios: {
      statusbarPadding: true
    }
  }
} // http://ionicframework.com/docs/v2/api/config/Config/
);
