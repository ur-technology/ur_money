import {ViewChild} from '@angular/core';
import {App, Platform, MenuController, Nav} from 'ionic-angular';
import {Component, Type} from '@angular/core';
import {StatusBar} from 'ionic-native';
import {FIREBASE_PROVIDERS, defaultFirebase, firebaseAuthConfig, AuthProviders, AuthMethods} from 'angularfire2';
import {Auth} from './components/auth/auth';
import {ChartData} from './components/chart-data/chart-data';
import * as _ from 'underscore';
import {Registration1Page} from './pages/registration/registration1';
import {HomePage} from './pages/home/home';

import {SendPage} from './pages/send/send';
import {ReceivePage} from './pages/receive/receive';
import {MyNetworkPage} from './pages/my-network/my-network';
import {InvitePage} from './pages/invite/invite';

import {UserService} from './providers/user-service/user-service';
import {LoadingModal} from './components/loading-modal/loading-modal';

// temporarily support prelaunch sign-up app
import {DashboardPage} from './prelaunch_pages/dashboard/dashboard';
import {SignUpPage} from './prelaunch_pages/sign-up/sign-up';
import {ErrorPage} from './prelaunch_pages/error/error';
import {FirebaseService} from './prelaunch_components/firebase-service/firebase-service';

@App({
  templateUrl: 'build/app.html',
  directives: [LoadingModal],
  providers: [Auth, ChartData, LoadingModal, UserService, FirebaseService, FIREBASE_PROVIDERS, defaultFirebase(Auth.firebaseUrl()),
    firebaseAuthConfig({
      provider: AuthProviders.Custom, method: AuthMethods.CustomToken, remember: 'default' // scope: ['email']
    })
  ],
  config: {
    mode: 'ios',
    platforms: {
      ios: {
        statusbarPadding: true
      }
    }
  } // http://ionicframework.com/docs/v2/api/config/Config/
})
class UrMoney {
  @ViewChild(Nav) nav: Nav;

  // rootPage: any = Registration1Page;
  pages: Array<{ title: string, component: any }>;
  user: any = {};
  invitePage: Type;
  constructor(private platform: Platform, private menu: MenuController, public auth: Auth) {
    this.initializeApp();
   
    console.log(this.auth.user);
    // set our app's pages
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'My Network', component: MyNetworkPage },
      { title: 'Send UR/Message', component: SendPage },
      { title: 'Receive UR', component: ReceivePage }
    ];
  }

  handlePrelaunchRequest() {
    var phone = null;
    var matchResults = window.location.pathname.match(/(\/go\/|[\?\&]p\=)(\d{10})\b/);
    if (matchResults && matchResults.length == 3) {
      phone = matchResults[2];
    }
    if (!phone) {
      return false; // this is not a prelaunch request
    }
    phone = "+1" + phone;

    this.auth.firebaseRef().child("users").orderByChild("phone").equalTo(phone).limitToFirst(1).once(
      "value", (snapshot) => {
        var snapshotData = snapshot.val();
        var users = _.values(snapshotData || {});
        if (users.length == 0 && phone == '+16158566616') {
          users = [{ phone: phone }];
        }
        if (users.length == 0) {
          this.nav.setRoot(ErrorPage, { message: "could not find phone number" });
          return true;
        }

        var user = users[0];
        this.nav.setRoot(user.signedUpAt ? DashboardPage : SignUpPage, { user: user });
      });
    return true;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      if (this.platform.is('cordova')) {
        StatusBar.styleDefault();
      }

      if (this.handlePrelaunchRequest()) {
        return;
      }

      this.auth.respondToAuth(this.nav, HomePage, Registration1Page);
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }

  visitInvitePage() {
    this.menu.close();
    this.nav.setRoot(InvitePage);
  }

  signOut() {
    this.menu.close();
    this.auth.firebaseRef().unauth(); // this will trigger redirect to Registration1Page
  }
}
