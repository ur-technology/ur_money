import {ViewChild} from '@angular/core';
import {App, Platform, MenuController, Nav} from 'ionic-angular';
import {Component} from '@angular/core';
import {StatusBar} from 'ionic-native';
import {FIREBASE_PROVIDERS, defaultFirebase, firebaseAuthConfig, AuthProviders, AuthMethods} from 'angularfire2';
import {Auth} from './components/auth/auth';
import * as _ from 'underscore';

@App({
  templateUrl: 'build/app.html',
  providers: [
    Auth,
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

  initializeApp() {
    this.platform.ready().then(() => {
      this.auth.respondToAuth(this.nav);

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
}
