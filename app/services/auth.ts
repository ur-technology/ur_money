import {Injectable, Inject, ViewChild} from '@angular/core'
import {Nav} from 'ionic-angular';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable, AuthMethods} from 'angularfire2'
import * as _ from 'lodash';
import * as log from 'loglevel';
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
    return new Promise((resolve) => {
      var phoneVerificationRef = firebase.database().ref('/phoneVerifications').push({
        phone: phone,
        status: "verification-code-requested",
        createdAt: firebase.database.ServerValue.TIMESTAMP
      })
      phoneVerificationRef.then((xxx) => {
        log.debug("verification request queued");
        phoneVerificationRef.on('value', (snapshot) => {
          let phoneVerification = snapshot.val();
          if (!phoneVerification || phoneVerification.status == "verification-code-requested") {
            return; // not yet processed
          }
          phoneVerificationRef.off('value');

          if (phoneVerification.status != "verification-code-sent-via-sms"
            && phoneVerification.status != "verification-code-not-sent-via-sms") {
            log.debug(`phoneVerification ${phoneVerificationRef.key} has status ${phoneVerification.status}`);
            return;
          }
          log.debug(`phoneVerification.verificationCode=${phoneVerification.verificationCode}`);
          resolve({
            phoneVerificationKey: phoneVerificationRef.key,
            error: phoneVerification.error
          });
        });
      });
    });
  }

  checkVerificationCode(phoneVerificationKey: string, submittedVerificationCode: string) {
    return new Promise((resolve) => {
      let phoneVerificationRef = firebase.database().ref(`/phoneVerifications/${phoneVerificationKey}`);
      phoneVerificationRef.update({ submittedVerificationCode: submittedVerificationCode, status: "verification-code-submitted-via-app" }).then((xxx) => {
        phoneVerificationRef.on('value', (snapshot) => {
          let phoneVerification = snapshot.val();
          if (!phoneVerification || phoneVerification.status == "verification-code-submitted-via-app") {
            return; // not yet processed
          }
          phoneVerificationRef.off('value');
          if (phoneVerification.status == "verification-succeeded") {
            firebase.auth().signInWithCustomToken(phoneVerification.authToken).then((authData) => {
              log.debug('Authentication succeded!');
              phoneVerificationRef.remove();
              resolve(true);
            }).catch((error) => {
              log.warn('Authentication failed!');
              resolve(false);
            });
          } else if (phoneVerification.status == "verification-failed") {
            phoneVerificationRef.remove();
            resolve(false);
          } else {
            log.warn(`phoneVerification ${phoneVerificationRef.key} has unexpected status ${phoneVerification.status}`);
            resolve(false);
          }
        });
      })
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
        log.debug("unable to get country code from sim", error);
        resolve(undefined);
      });
    });
  }

}
