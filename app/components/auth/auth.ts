import {Injectable, Inject, ViewChild} from '@angular/core'
import {Nav} from 'ionic-angular';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable, AuthMethods} from 'angularfire2'
import {Component} from '@angular/core';
import * as _ from 'lodash';
import {Subscription} from 'rxjs';

@Injectable()
export class Auth {
  public uid: string
  public userRef: string
  public user: FirebaseObjectObservable<any>;
  public userObject: any;

  // public authDataProfileImage: any
  // public authDataProfileName: any
  // public authDataProfileDescription: any
  // public authDataProfileEmail: any

  constructor(public angularFire: AngularFire) {
  }

  static isProduction() {
    // TODO: this will work only for webapp, not for mobile app -- need to fix this
    return /ur\.capital$|urcapital-production\.firebaseapp\.com$/.test(window.location.hostname);
  }

  static firebaseConfig() {
    if (Auth.isProduction()) {
      return  {
        apiKey: "AIzaSyBUGCRu1n2vFgyFgTVhyoRbKz39MsDMvvw",
        authDomain: "ur-money-staging.firebaseapp.com",
        databaseURL: "https://ur-money-staging.firebaseio.com",
        storageBucket: "ur-money-staging.appspot.com",
      };
    } else {
      return  {
        apiKey: "AIzaSyBUGCRu1n2vFgyFgTVhyoRbKz39MsDMvvw",
        authDomain: "ur-money-staging.firebaseapp.com",
        databaseURL: "https://ur-money-staging.firebaseio.com",
        storageBucket: "ur-money-staging.appspot.com",
      };
    }
  }

  respondToAuth(nav: Nav, welcomePage: any, walletSetupPage: any, homePage: any) {
    firebase.auth().onAuthStateChanged((authData) => {
    // this.angularFire.auth.subscribe((authData) => {
      if (authData) {
        this.uid = authData.uid;
        this.user = this.angularFire.database.object(`/users/${this.uid}`);
        let subscriptionUser: Subscription = this.user.subscribe((userObject) => {
          if((subscriptionUser) && (!subscriptionUser.isUnsubscribed)){
            this.userObject = userObject;
            subscriptionUser.unsubscribe()
          }
          if (userObject.wallet && userObject.wallet.publicKey) {
            nav.setRoot(homePage);
          } else {
            nav.setRoot(walletSetupPage);
          }
        });
      } else {
        this.uid = undefined;
        this.user = undefined;
        nav.setRoot(welcomePage);
      }
    });
  }

  requestPhoneVerification(phone: string) {
    let angularFire = this.angularFire;
    return new Promise((resolve) => {
      console.log('about to queue verification number');

      var phoneVerificationReference = angularFire.database.list('/phoneVerifications', { preserveSnapshot: true }).push({
        phone: phone,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });

      console.log("verification queued");
      phoneVerificationReference.on('value', (snapshot) => {
        console.log(snapshot);
        var phoneVerification = snapshot.val();
        console.log(phoneVerification);
        if (phoneVerification && !_.isUndefined(phoneVerification.smsSuccess)) {
          console.log("resolving promise");
          phoneVerificationReference.off('value'); // stop watching for changes on this phone verification
          resolve({ phoneVerificationKey: snapshot.key, smsSuccess: phoneVerification.smsSuccess, smsError: phoneVerification.smsError });
        }
      });
    });
  }

  checkVerificationCode(phoneVerificationKey: string, attemptedVerificationCode: string) {
    let angularFire = this.angularFire;
    return new Promise((resolve) => {
      let phoneVerificationObservable: FirebaseObjectObservable<any> = angularFire.database.object(`/phoneVerifications/${phoneVerificationKey}`);
      phoneVerificationObservable.update({ attemptedVerificationCode: attemptedVerificationCode });
      let phoneVerificationSubscription: Subscription = phoneVerificationObservable.subscribe((phoneVerification) => {
        if (phoneVerification && !_.isUndefined(phoneVerification.verificationSuccess)) {
          if (phoneVerification.verificationSuccess) {
            // let options = {provider: AuthProviders.Custom,method: AuthMethods.CustomToken};
            // angularFire.auth.login(phoneVerification.authToken, options).then((authData) => {
            firebase.auth().signInWithCustomToken(phoneVerification.authToken).then((authData) => {
              console.log('Authentication succeded!');
              stopWatchingPhoneVerificationAndResolvePromise(true);
            }).catch((error) => {
              console.log('Authentication failed!');
              stopWatchingPhoneVerificationAndResolvePromise(false);
            });
          } else {
            stopWatchingPhoneVerificationAndResolvePromise(false);
          }
        }
      });

      function stopWatchingPhoneVerificationAndResolvePromise(success) {
        phoneVerificationSubscription.unsubscribe();
        if (success) {
          phoneVerificationObservable.remove();
        }
        resolve(success);
      }
    });
  }

  isSignedIn() {
    return !!this.uid;
  }

}
