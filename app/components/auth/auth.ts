import {Injectable, Inject, ViewChild} from '@angular/core'
import {Nav} from 'ionic-angular';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable, AuthMethods} from 'angularfire2'
import * as _ from 'lodash';
import {Subscription} from 'rxjs';
import {ContactsService} from '../services/contacts-service';
import {Sim} from 'ionic-native';

@Injectable()
export class Auth {
  public currentUserId: string
  public currentUserRef: FirebaseObjectObservable<any>;
  public currentUser: any;
  public countryCode: string;

  // public authDataProfileImage: any
  // public authDataProfileName: any
  // public authDataProfileDescription: any
  // public authDataProfileEmail: any

  constructor(public angularFire: AngularFire, public contactsService: ContactsService) {
  }

  respondToAuth(nav: Nav, welcomePage: any, walletSetupPage: any, homePage: any) {
    let self = this;
    firebase.auth().onAuthStateChanged((authData) => {
      if (authData) {
        self.currentUserId = authData.uid;
        self.currentUserRef = self.angularFire.database.object(`/users/${self.currentUserId}`);
        let userSubscription: Subscription = self.currentUserRef.subscribe((currentUser) => {
          if (userSubscription && !userSubscription.isUnsubscribed) {
            userSubscription.unsubscribe()
          }
          self.currentUser = currentUser;
          self.getSimCountryCode().then((countryCode) => {
            self.countryCode = countryCode || currentUser.countryCode;
            self.contactsService.load(self.countryCode, self.currentUserId);
          });
          if (currentUser.wallet && currentUser.wallet.address) {
            nav.setRoot(homePage);
          } else {
            nav.setRoot(walletSetupPage);
          }
        });
      } else {
        self.currentUserId = undefined;
        self.currentUserRef = undefined;
        self.currentUser = undefined;
        self.countryCode = undefined;
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
    return !!this.currentUser;
  }

  private getSimCountryCode(): Promise<string> {
    return new Promise((resolve, reject) => {
      Sim.getSimInfo().then((info) => {
        resolve(info.countryCode.toUpperCase());
      }, (error) => {
        console.log("unable to get country code from sim", error);
        resolve(undefined);
      });
    });
  }

}
