import {ViewChild} from '@angular/core';
import {App, Platform, MenuController, Nav} from 'ionic-angular';
import {Component} from '@angular/core';
import {StatusBar} from 'ionic-native';
import {FIREBASE_PROVIDERS, defaultFirebase, firebaseAuthConfig, AuthProviders, AuthMethods} from 'angularfire2';
import {Auth} from './components/auth/auth';
import * as _ from 'underscore';
import {Welcome1Page} from './pages/welcome/welcome1';
import {Welcome4Page} from './pages/welcome/welcome4';
import {HomePage} from './pages/home/home';

import {DashboardPage} from './prelaunch_pages/dashboard/dashboard';
import {SignUpPage} from './prelaunch_pages/sign-up/sign-up';
import {ErrorPage} from './prelaunch_pages/error/error';
import {FirebaseService} from './prelaunch_components/firebase-service/firebase-service';

@App({
  templateUrl: 'build/app.html',
  providers: [
    Auth,
    FirebaseService,
    FIREBASE_PROVIDERS,
    defaultFirebase(Auth.firebaseUrl()),
    firebaseAuthConfig({
      provider: AuthProviders.Custom,
      method: AuthMethods.CustomToken,
      remember: 'default'
      // scope: ['email']
    })
  ],
  config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
class UrMoney {
  @ViewChild(Nav) nav: Nav;

  // rootPage: any = Welcome1Page;
  pages: Array<{title: string, component: any}>;

  constructor(
    private platform: Platform,
    private menu: MenuController,
    public auth: Auth
  ) {
    this.initializeApp();

    // // set our app's pages
    // this.pages = [
    //   { title: 'Welcome - Step 1', component: Welcome1Page },
    //   { title: 'Welcome - Step 2', component: Welcome2Page },
    // ];
  }

  handlePrelaunchRequest() {
    var phone = null;
    var matchResults = window.location.pathname.match(/\/go\/(\d{10})/);
    if (matchResults && matchResults.length >= 2) {
      phone = matchResults[1];
    } else {
      matchResults = window.location.search.match(/[?&]p=(\d{10})/);
      if (matchResults && matchResults.length >= 2) {
        phone = matchResults[1];
      }
    }
    if (!phone) {
      return false; // this is not a prelaunch request
    }

    Auth.firebaseRef().child("users").orderByChild("phone").equalTo(phone).limitToFirst(1).once(
      "value", (snapshot) => {
      var snapshotData = snapshot.val();
      var users = _.values(snapshotData || {});
      if (users.length == 0 && phone == '6158566616') {
        users =  [{phone: '6158566616'}];
      }
      if (users.length == 0) {
       this.nav.setRoot(ErrorPage, {message: "could not find phone number"});
        return true;
      }

      var user = users[0];
      this.nav.setRoot(user.signedUpAt ? DashboardPage : SignUpPage, {user: user});
    });
    return true;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      StatusBar.styleDefault();

      if (this.handlePrelaunchRequest()) {
        return;
      }

      this.auth.respondToAuth( () => {
        this.nav.setRoot(this.auth.user.onboardingComplete ? HomePage : Welcome4Page );
      }, () => {
        this.nav.setRoot(Welcome1Page);
      });

    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
}
