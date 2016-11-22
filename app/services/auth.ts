import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
import {AngularFire, FirebaseObjectObservable} from 'angularfire2';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';
import {Subscription} from 'rxjs';
import {ContactsService} from '../services/contacts';
import {Sim} from 'ionic-native';
import {Config} from '../config/config';

@Injectable()
export class AuthService {
  public currentUserId: string;
  public currentUserRef: FirebaseObjectObservable<any>;
  public currentUser: any;
  public countryCode: string;
  public taskId: string;
  private firebaseConnectionCheckInProgress: boolean = false;

  constructor(
    public angularFire: AngularFire,
    public contactsService: ContactsService,
    public platform: Platform
  ) {
  }

  respondToAuth(nav: any, pages: any) {
    let self = this;
    self.checkFirebaseConnection().then(() => {
      firebase.auth().onAuthStateChanged((authData: any) => {
        if (authData) {
          self.currentUserId = authData.uid;
          self.currentUserRef = self.angularFire.database.object(`/users/${self.currentUserId}`);
          let userSubscription: Subscription = self.currentUserRef.subscribe((currentUser) => {
            if (userSubscription && !userSubscription.isUnsubscribed) {
              userSubscription.unsubscribe();
            }
            self.currentUser = currentUser;
            let status = _.trim((currentUser.registration && currentUser.registration.status) || '') || 'initial';
            self.getSimCountryCode().then((countryCode) => {
              self.countryCode = _.trim(countryCode || currentUser.countryCode || '');
              if (!self.countryCode) {
                log.warn('country code not defined for this user');
              }
              if (status !== 'initial') {
                self.contactsService.loadContacts(self.countryCode, self.currentUserId, self.currentUser.phone);
              }
            });
            nav.setRoot({
              'initial': pages.introPage,
              'verification-requested': pages.verificationPendingPage,
              'verification-pending': pages.verificationPendingPage,
              'verification-failed': pages.verificationFailedPage,
              'verification-succeeded': currentUser.wallet && currentUser.wallet.address ? pages.homePage : pages.walletSetupPage,
              'announcement-requested': pages.homePage,
              'announcement-failed': pages.homePage,
              'announcement-succeeded': pages.homePage
            }[status]);
          });
        } else {
          // TODO: turn off all firebase listeners (on, once, subscribe, etc), such as in chat-list.ts and home.ts
          self.currentUserId = undefined;
          self.currentUserRef = undefined;
          self.currentUser = undefined;
          self.countryCode = undefined;
          nav.setRoot(pages.welcomePage);
        }
      });
    }, (error) => {
      if (error.messageKey === 'noInternetConnection') {
        nav.setRoot(pages.noInternetConnectionPage);
      } else {
        log.warn(`got error: ${error}`);
      }
    });
  }

  reloadCurrentUser(): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      firebase.database().ref(`/users/${self.currentUserId}`).once('value', data => {
        self.currentUser = data.val();
        resolve();
      });
    });
  }

  checkFirebaseConnection(): Promise<any> {
    let self = this;
    self.firebaseConnectionCheckInProgress = true;
    return new Promise((resolve, reject) => {

      firebase.database().ref('/connectionCheckDummyData').once('value', (snapshot) => {
        if (self.firebaseConnectionCheckInProgress) {
          self.firebaseConnectionCheckInProgress = false;
          resolve();
        }
      });

      setTimeout(() => {
        if (self.firebaseConnectionCheckInProgress) {
          var connectedRef = firebase.database().ref('.info/connected');
          connectedRef.on('value', (connectedSnapshot) => {
            connectedRef.off('value');
            if (self.firebaseConnectionCheckInProgress) {
              self.firebaseConnectionCheckInProgress = false;
              let connected = connectedSnapshot.val();
              if (connected) {
                resolve();
              } else {
                reject({messageKey: 'noInternetConnection'});
              }
            }
          });
        }
      }, 7 * 1000);
    });
  }

  requestPhoneVerification(phone: string, countryCode: string) {
    let self = this;
    return new Promise((resolve) => {
      let taskRef = firebase.database().ref('/phoneAuthenticationQueue/tasks').push({ phone: phone, countryCode: countryCode });
      self.taskId = taskRef.key;
      taskRef.then((xxx) => {
        log.debug(`task queued to /phoneAuthenticationQueue/tasks/${self.taskId}`);
        let stateRef = taskRef.child('_state');
        stateRef.on('value', (snapshot) => {
          let state = snapshot.val();
          if (state !== undefined && state !== null && state !== 'code_generation_in_progress') {
            stateRef.off('value');
            resolve(state);
          }
        });
      });
    });
  }

  checkVerificationCode(submittedVerificationCode: string) {
    let self = this;
    return new Promise((resolve) => {
      let taskRef = firebase.database().ref(`/phoneAuthenticationQueue/tasks/${self.taskId}`);
      taskRef.update({
        submittedVerificationCode: submittedVerificationCode,
        _state: 'code_matching_requested' // TODO: add rule that allows only this client-initiated state change
      }).then((xxx) => {
        log.debug(`set submittedVerificationCode to ${submittedVerificationCode} at ${taskRef.toString()}`);
        let verificationResultRef = taskRef.child('verificationResult');
        verificationResultRef.on('value', (snapshot) => {
          let verificationResult = snapshot.val();
          if (!verificationResult) {
            return;
          }
          verificationResultRef.off('value');
          if (verificationResult.error) {
            resolve({ error: verificationResult.error });
          } else if (verificationResult.codeMatch) {
            log.debug('Submitted verification code was correct.');

            firebase.auth().signInWithCustomToken(verificationResult.authToken).then((authData) => {
              log.debug('Authentication succeded!');
              taskRef.remove();
              resolve({ codeMatch: true });
            }).catch((error) => {
              log.warn('Authentication failed!');
              taskRef.update({ authenticationError: error });
              resolve({ error: 'Authentication failed' });
            });
          } else {
            log.debug('Submitted verification code was not correct.');
            verificationResultRef.remove();
            resolve({ codeMatch: false });
          }
        });
      });
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
        log.debug('unable to get country code from sim', error);
        resolve(undefined);
      });
    });
  }

  envMode() {
    let matches = Config.firebaseProjectId.match(/ur-money-(\w+)/);
    if (matches && matches[1] && matches[1] !== 'production') {
      return _.startCase(`${matches[1]} mode`);
    } else {
      return '';
    }
  }
}
