import {ViewChild, Component, Type} from '@angular/core';
import {ionicBootstrap, Platform, MenuController, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {FIREBASE_PROVIDERS, defaultFirebase, firebaseAuthConfig, AuthProviders, AuthMethods} from 'angularfire2';
import {Auth} from './components/auth/auth';
import {ChartData} from './components/chart-data/chart-data';
import {Registration1Page} from './pages/registration/registration1';
import {Registration4Page} from './pages/registration/registration4';
import {HomePage} from './pages/home/home';

import {SendPage} from './pages/send/send';
import {ReceivePage} from './pages/receive/receive';
import {InvitePage} from './pages/invite/invite';
import {AboutPage} from './pages/about/about';
import {CommunityPage} from './pages/community/community';
import {TransactionsPage} from './pages/transactions/transactions';
import {SettingPage} from './pages/setting/setting';
import {TransactionNavService} from './pages/transactions/transaction-nav-service';
import {CountryListService} from './components/country-list/country-list.service';
import {LoadingModal} from './components/loading-modal/loading-modal';

import {NativeContactsService} from './components/services/native-contact.service';
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
    NativeContactsService,  
    TransactionNavService,
    CountryListService,
    ChartData,
    LoadingModal,
    PrelaunchService,
    FIREBASE_PROVIDERS,
    defaultFirebase(Auth.firebaseConfig()),
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

    this.invitePage = { component: InvitePage };
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
    this.nav.push(SettingPage);
  }

  visitInvitePage() {
    this.menu.close();
    this.nav.setRoot(InvitePage);
  }

  signOut() {
    this.menu.close();
    this.auth.angularFire.auth.logout(); // this will trigger redirect to Registration1Page
  }


  generateFaceUrl(firstName, lastName) {
    var colorScheme = _.sample([
      {
        background: "ED6D54",
        foreground: "FFFFFF"
      }]);

    var sourceOfInitials = firstName;
    if (firstName) {
      var firstLetters = sourceOfInitials.match(/\b\w/g);
      var initials = firstLetters[0];
      var lastNameFirstLetter = lastName.match(/\b\w/g);
      initials = initials + lastNameFirstLetter[0];
      initials = initials.toUpperCase();
      return "https://dummyimage.com/100x100/" + colorScheme.background + "/" + colorScheme.foreground + "&text=" + initials;
    }
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
