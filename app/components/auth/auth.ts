import {Injectable, Inject, ViewChild} from '@angular/core'
import {Nav} from 'ionic-angular';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable, AuthMethods} from 'angularfire2'
import {Component} from '@angular/core';
import * as lodash from 'lodash';
import {Subscription} from 'rxjs';

@Injectable()
export class Auth {
  public uid: string
  public userRef: string
  public user: FirebaseObjectObservable<any>;

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
      return {
        apiKey: "AIzaSyD6hVJZIofMZFERyvycbjPg4dgNVYFvDXM",
        authDomain: "urcapital-production.firebaseapp.com",
        databaseURL: "https://urcapital-production.firebaseio.com",
        storageBucket: "urcapital-production.appspot.com",
      };
    } else {
      return  {
        apiKey: "AIzaSyB8Krsnc9_CKN1IsJl_5R7QteQ5S-39dWs",
        authDomain: "urcapital-staging.firebaseapp.com",
        databaseURL: "https://urcapital-staging.firebaseio.com",
        storageBucket: "urcapital-staging.appspot.com",
      };
    }
  }

  respondToAuth(nav: Nav, authPage: any, unauthPage: any) {
    this.angularFire.auth.subscribe((authData) => {
      if (authData) {
        this.uid = authData.uid;
        this.userRef = `/users/${this.uid}`;
        this.user = this.angularFire.database.object(this.userRef);
        nav.setRoot(authPage);
      } else {
        this.uid = undefined;
        this.user = undefined;
        nav.setRoot(unauthPage);
      }
    });
  }

  requestPhoneVerification(phone: string) {
    let database = this.angularFire.database;
    return new Promise((resolve) => {
      console.log('about to queue verification number');

      var phoneVerificationReference = database.list('/phoneVerifications', { preserveSnapshot: true }).push({
        phone: phone,
        createdAt: Date.parse(new Date().toISOString()) // would like to change this to database.ServerValue.TIMESTAMP
      });

      console.log("verification queued");
      phoneVerificationReference.on('value', (snapshot) => {
        console.log(snapshot);
        var phoneVerification = snapshot.val();
        console.log(phoneVerification);
        if (phoneVerification && lodash.isBoolean(phoneVerification.smsSuccess)) {
          console.log("resolving promise");
          phoneVerificationReference.off('value'); // stop watching for changes on this phone verification
          resolve({ phoneVerificationKey: snapshot.key, smsSuccess: phoneVerification.smsSuccess, smsError: phoneVerification.smsError });
        }
      });
    });
  }

  checkVerificationCode(phoneVerificationKey: string, attemptedVerificationCode: string) {
    return new Promise((resolve) => {
      let phoneVerificationObservable: FirebaseObjectObservable<any> = this.angularFire.database.object(`/phoneVerifications/${phoneVerificationKey}`);
      phoneVerificationObservable.update({ attemptedVerificationCode: attemptedVerificationCode });
      let phoneVerificationSubscription: Subscription = phoneVerificationObservable.subscribe((phoneVerification) => {
        if (phoneVerification && lodash.isBoolean(phoneVerification.smsSuccess)) {
          if (phoneVerification.verificationSuccess) {
            this.angularFire.auth.login(phoneVerification.authToken).then((authData) => {
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
