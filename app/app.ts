import {ViewChild, Component, Type} from '@angular/core';
import {HTTP_PROVIDERS } from '@angular/http';
import {ionicBootstrap, Platform, MenuController, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {FIREBASE_PROVIDERS, defaultFirebase, firebaseAuthConfig, AuthProviders, AuthMethods} from 'angularfire2';
import {Auth} from './components/auth/auth';
import {ChartData} from './components/chart-data/chart-data';
import {TransactionNavService} from './pages/transactions/transaction-nav-service';
import {CountryListService} from './components/services/country-list-service';
import {LoadingModal} from './components/loading-modal/loading-modal';
import {ContactsService} from './components/services/contacts-service';
import {DeviceIdentityService} from './components/services/device-identity.service';
import {Config} from './components/config/config'; // TODO: make this injectable

import {Registration1Page} from './pages/registration/registration1';
import {Registration4Page} from './pages/registration/registration4';
import {HomePage} from './pages/home/home';
import {SendPage} from './pages/send/send';
import {ReceivePage} from './pages/receive/receive';
import {ContactsPage} from './pages/contacts/contacts';
import {AboutPage} from './pages/about/about';
import {SettingsPage} from './pages/settings/settings';
import {TransactionsPage} from './pages/transactions/transactions';

// temporarily support prelaunch sign-up app
import {DashboardPage} from './prelaunch_pages/dashboard/dashboard';
import {SignInPage} from './prelaunch_pages/sign-in/sign-in';
import {SignUpPage} from './prelaunch_pages/sign-up/sign-up';
import {ErrorPage} from './prelaunch_pages/error/error';
import {PrelaunchService} from './prelaunch_components/prelaunch-service/prelaunch-service';

import * as _ from 'lodash';

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
    PrelaunchService,
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
  invitePage: {};
  faceUrl: string;
  constructor(private platform: Platform, private menu: MenuController, public auth: Auth, public prelaunchService: PrelaunchService) {
    this.initializeApp();

    // set our app's pages
    this.menuItems = [
      { title: 'Home', component: HomePage, icon: 'icon menu-icon-1' },
      { title: 'Send UR', component: SendPage, icon: 'icon menu-icon-2' },
      { title: 'Request UR', component: ReceivePage, icon: 'icon menu-icon-3' },
      { title: 'Transactions', component: TransactionsPage, icon: 'icon menu-icon-4' },
      { title: 'About UR', component: AboutPage, icon: 'icon menu-icon-7' }
    ];
  }

  isPrelaunchRequest() {
    return /[\/?&]go/.test(window.location.href);
  }

  handlePrelaunchRequest() {
    var phone = localStorage.getItem("prelaunchPhone");
    if (phone) {
      this.prelaunchService.lookupPrelaunchUserByPhone(phone, this.nav, DashboardPage, SignUpPage, ErrorPage);
    } else {
      this.nav.setRoot(SignInPage);
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      if (this.platform.is('cordova')) {
        StatusBar.styleDefault();
      }

      if (this.isPrelaunchRequest()) {
        this.handlePrelaunchRequest();
        return;
      }

      this.auth.respondToAuth(this.nav, Registration1Page, Registration4Page, HomePage);
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }

  openSetting() {
    this.menu.close();
    this.nav.push(SettingsPage);
  }

  inviteContact() {
    this.menu.close();
    this.nav.push(ContactsPage, {nonMembersFirst: true});
  }

  signOut() {
    this.menu.close();
    this.auth.angularFire.auth.logout(); // this will trigger redirect to Registration1Page
  }


  generateProfileImage() {
    var colorScheme = _.sample([
      { background: "ED6D54", foreground: "FFFFFF" }
    ]);
    var initials;
    if (this.auth.currentUser && this.auth.currentUser.firstName) {
      var firstLetters = this.auth.currentUser.firstName.match(/\b\w/g);
      initials = firstLetters[0];
      var lastNameFirstLetter = (this.auth.currentUser.lastName || '').match(/\b\w/g);
      initials = initials + lastNameFirstLetter[0];
      initials = initials.toUpperCase();
    } else {
      initials = "UP";
    }
    return "https://dummyimage.com/100x100/" + colorScheme.background + "/" + colorScheme.foreground + "&text=" + initials;
  };


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
