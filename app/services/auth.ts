import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
import {AngularFire, FirebaseObjectObservable} from 'angularfire2';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';
import {Subscription} from 'rxjs';
import {ContactsService} from '../services/contacts';
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
            if (self.countryCode) {
              self.currentUser.countryCode = self.countryCode;
              this.currentUserRef.update({ countryCode: self.countryCode });
            }
            let status = self.getUserStatus();
            if (status === 'initial') {
              nav.setRoot(pages.introPage);
            } else {
              self.contactsService.loadContacts(self.currentUser.countryCode, self.currentUserId, self.currentUser.phone);
              nav.setRoot(pages.homePage);
            }
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
                reject({ messageKey: 'noInternetConnection' });
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

  checkVerificationCode(submittedVerificationCode: string, countryIso: string) {
    this.countryCode = countryIso;
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
              resolve({ codeMatch: true });
              taskRef.remove();
            }).catch((error) => {
              log.warn('Authentication failed!');
              taskRef.update({ authenticationError: error });
              resolve({ error: 'Authentication failed' });
              resolve(false);
            });
          } else {
            log.debug('Submitted verification code was not correct.');
            resolve({ codeMatch: false });
            verificationResultRef.remove();
          }
        });
      });
    });
  }

  isSignedIn() {
    return !!this.currentUser;
  }

  private getSupportedCountryCodes() {
    let supportedCountries: Array<string> = ['US'];
    return supportedCountries;
  }

  isUserInSupportedCountry() {
    return this.getSupportedCountryCodes().indexOf(this.currentUser.countryCode) !== -1;
  }

  getUserStatus() {
    let status = _.trim((this.currentUser.registration && this.currentUser.registration.status) || '') || 'initial';
    if ((this.currentUser.wallet && this.currentUser.wallet.address) && (status === 'initial')) {
      status = 'wallet-generated';
    }
    return status;
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
