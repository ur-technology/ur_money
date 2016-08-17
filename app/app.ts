import {ViewChild, Component, Type} from '@angular/core';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
import {HTTP_PROVIDERS } from '@angular/http';
import {ionicBootstrap, Platform, MenuController, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {FIREBASE_PROVIDERS, defaultFirebase, firebaseAuthConfig, AuthProviders, AuthMethods} from 'angularfire2';
import * as _ from 'lodash';
import * as log from 'loglevel';

import {Config} from './config/config';
import {AuthService} from './services/auth';
import {ChartDataService} from './services/chart-data';
import {CountryListService} from './services/country-list';
import {LoadingModalComponent} from './components/loading-modal/loading-modal';
import {ContactsService} from './services/contacts';
import {DeviceIdentityService} from './services/device-identity';
import {EventsService} from './services/events';

import {ContactsAndChatsPage} from './pages/contacts-and-chats/contacts-and-chats';
import {Registration1Page} from './pages/registration/registration1';
import {Registration4Page} from './pages/registration/registration4';
import {HomePage} from './pages/home/home';
import {ChatPage} from './pages/chat/chat';
import {SendPage} from './pages/send/send';
import {RequestPage} from './pages/request/request';
import {AboutPage} from './pages/about/about';
import {SettingsPage} from './pages/settings/settings';
import {TransactionsPage} from './pages/transactions/transactions';
import {DownloadPage} from './pages/download/download';

@Component({
  templateUrl: 'build/app.html',
  directives: [LoadingModalComponent],
  providers: [
    AuthService,
    DeviceIdentityService,
    ContactsService,
    EventsService,
    CountryListService,
    ChartDataService,
    LoadingModalComponent,
    FIREBASE_PROVIDERS,
    HTTP_PROVIDERS,
    defaultFirebase(Config.firebase),
    firebaseAuthConfig({
      provider: AuthProviders.Custom, method: AuthMethods.CustomToken, remember: 'default' // scope: ['email']
    })
  ]
})
class UrMoney {
  @ViewChild(Nav) nav: Nav;
  menuItems: Array<{ title: string, page: any, pageParams?: any, icon: string }>;

  constructor(private platform: Platform, private menu: MenuController, public auth: AuthService) {
    this.initializeApp();
  }

  initializeApp() {
    this.menuItems = [
      { title: 'Home', page: HomePage, icon: 'icon menu-icon menu-icon-home' },
      { title: 'Chat', page: ContactsAndChatsPage, pageParams: { goal: "chat" }, icon: 'icon menu-icon menu-icon-chat' },
      { title: 'Send UR', page: ContactsAndChatsPage, pageParams: { goal: "send" }, icon: 'icon menu-icon menu-icon-send-ur' },
      { title: 'Request UR', page: ContactsAndChatsPage, pageParams: { goal: "request" }, icon: 'icon menu-icon menu-icon-request-ur' },
      { title: 'Transactions', page: TransactionsPage, icon: 'icon menu-icon menu-icon-transactions' },
      { title: 'About UR', page: AboutPage, icon: 'icon menu-icon menu-icon-about' }
    ];

    this.platform.ready().then(() => {

      if (this.platform.is('cordova')) {
        StatusBar.styleDefault();
      }

      let logLevel = { "trace": 0, "debug": 1, "info": 2, "warn": 3, "error": 4, "silent": 5 }[Config.logLevel] || 1;
      log.setDefaultLevel(logLevel);

      if (/^\/app/.test(window.location.pathname) || /^\?app/.test(window.location.search)) {
        this.nav.setRoot(DownloadPage, {}, { animate: true, direction: 'forward' });
        return;
      }

      this.auth.respondToAuth(this.nav, Registration1Page, Registration4Page, HomePage, ChatPage);

      log.info(`UrMoney initialized with firebaseProjectId ${Config.firebaseProjectId}`);
    });
  }

  openPage(menuItem) {
    this.menu.close();
    if (menuItem.page == HomePage) {
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
    this.nav.push(ContactsAndChatsPage, { goal: "invite" }, { animate: true, direction: 'forward' });
  }

}

ionicBootstrap(UrMoney, [disableDeprecatedForms(),
  provideForms()], {
    mode: 'ios',
    tabsHideOnSubPages: false,
    platforms: {
      ios: {
        statusbarPadding: false
      },
    }
  }
);
