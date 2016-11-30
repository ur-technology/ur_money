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
  public authenticationRequestCountryCode: string;
  public taskId: string;
  public priorTaskType: string;
  public authenticatedEmail: string;
  public unauthenticatedEmail: string;
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
            if (self.authenticationRequestCountryCode &&
              (!self.currentUser.countryCode || !self.currentUser.countryCode.match(/^[A-Z]{2}$/))) {
              self.currentUser.countryCode = self.authenticationRequestCountryCode;
              this.currentUserRef.update({ countryCode: self.currentUser.countryCode });
            }
            let status = self.getUserStatus();
            if (status === 'initial') {
              nav.setRoot(pages.introPage);
            } else {
              self.contactsService.loadContacts(self.currentUserId, self.currentUser.phone, self.currentUser.countryCode);
              nav.setRoot(pages.homePage);
            }
          });
        } else {
          // TODO: turn off all firebase listeners (on, once, subscribe, etc), such as in chat-list.ts and home.ts
          self.currentUserId = undefined;
          self.currentUserRef = undefined;
          self.currentUser = undefined;
          self.authenticationRequestCountryCode = undefined;
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

  requestSmsAuthenticationCode(phone: string, countryCode: string) {
    let self = this;
    self.authenticationRequestCountryCode = countryCode;
    return new Promise((resolve, reject) => {
      let baseRef = firebase.database().ref('/smsAuthCodeGenerationQueue/tasks');
      self.taskId = self.priorTaskType === 'emailAuthCodeMatching' ? self.taskId : baseRef.push().key;
      let taskRef = baseRef.child(self.taskId);
      taskRef.set({ phone: phone }).then(() => {
        log.debug(`sms auth code request queued to ${taskRef.toString()}`);
        let stateRef = taskRef.child('_state');
        stateRef.on('value', (snapshot) => {
          let state = snapshot.val();
          if (_.includes([undefined, null, 'in_progress'], state)) {
            return;
          }

          stateRef.off('value');
          self.priorTaskType = 'smsAuthCodeGeneration';
          resolve(state);
        });
      }, (error) => {
        reject(error);
      });
    });
  }

  checkSmsAuthenticationCode(authenticationCode: string): Promise<boolean> {
    let self = this;
    return new Promise((resolve, reject) => {
      if (self.priorTaskType !== 'smsAuthCodeGeneration') {
        reject(`unexpected value ${self.priorTaskType} for priorTaskType`);
        return;
      }

      let taskRef = firebase.database().ref(`/smsAuthCodeMatchingQueue/tasks/${self.taskId}`);
      taskRef.set({ authenticationCode: authenticationCode }).then(() => {
        log.debug(`set authenticationCode to ${authenticationCode} at ${taskRef.toString()}`);
        let resultRef = taskRef.child('result');
        resultRef.on('value', (snapshot) => {
          let result = snapshot.val();
          if (!result) {
            return;
          }
          resultRef.off('value');

          if (!result.codeMatch) {
            log.debug('Submitted authentication code was not correct.');
            resolve(false);
            return;
          }

          log.debug('Submitted authentication code was correct.');
          firebase.auth().signInWithCustomToken(result.authToken).then((authData) => {
            log.debug('Authentication succeded!');
            self.cleanUpAssociatedAuthTasks();
            self.priorTaskType = 'smsAuthCodeMatching';
            resolve(true);
          }).catch((error) => {
            taskRef.update({ authenticationError: error });
            log.warn('Unable to authenticate!');
            reject('Unable to authenticate');
          });
        });
      });
    });
  }

  private cleanUpAssociatedAuthTasks() {
    firebase.database().ref(`/smsAuthCodeGenerationQueue/tasks/${this.taskId}`).remove();
    firebase.database().ref(`/smsAuthCodeMatchingQueue/tasks/${this.taskId}`).remove();
    firebase.database().ref(`/emailAuthCodeGenerationQueue/tasks/${this.taskId}`).remove();
    firebase.database().ref(`/emailAuthCodeMatchingQueue/tasks/${this.taskId}`).remove();
    this.authenticatedEmail = undefined;
    this.unauthenticatedEmail = undefined;
    this.taskId = undefined;
  }

  requestEmailAuthenticationCode(email: string) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.unauthenticatedEmail = email;
      self.authenticatedEmail = undefined;
      let baseRef = firebase.database().ref('/emailAuthCodeGenerationQueue/tasks');
      self.taskId = baseRef.push().key;
      let taskRef = baseRef.child(self.taskId);
      taskRef.set({ email: email }).then(() => {
        log.debug(`email auth code request made at ${taskRef.toString}`);
        let stateRef = taskRef.child('_state');
        stateRef.on('value', (snapshot) => {
          let state = snapshot.val();
          if (_.includes([undefined, null, 'in_progress'], state)) {
            return;
          }

          stateRef.off('value');
          self.priorTaskType = 'emailAuthCodeGeneration';
          resolve(state);
        });
      }, (error) => {
        reject(error);
      });
    });
  }

  checkEmailAuthenticationCode(authenticationCode: string): Promise<boolean> {
    let self = this;
    return new Promise((resolve, reject) => {
      if (self.priorTaskType !== 'emailAuthCodeGeneration') {
        reject(`unexpected value ${self.priorTaskType} for priorTaskType`);
        return;
      }

      let taskRef = firebase.database().ref(`/emailAuthCodeMatchingQueue/tasks/${self.taskId}`);
      taskRef.set({ authenticationCode: authenticationCode }).then(() => {
        log.debug(`set authenticationCode to ${authenticationCode} at ${taskRef.toString()}`);
        let resultRef = taskRef.child('result');
        resultRef.on('value', (snapshot) => {
          let result = snapshot.val();
          if (!result) {
            return;
          }
          resultRef.off('value');

          if (result.codeMatch) {
            log.debug('Submitted authentication code was correct.');

            // save info related to this email authentication for later
            self.priorTaskType = 'emailAuthCodeMatching';
            self.authenticatedEmail = self.unauthenticatedEmail;
            self.unauthenticatedEmail = undefined;
          } else {
            log.debug('Submitted authentication code was not correct.');
          }
          resolve(result.codeMatch);
        });
      });
    });
  }

  isSignedIn() {
    return !!this.currentUser;
  }

  private supportedCountryCodes() {
    return ['US'];
  }

  isUserInSupportedCountry() {
    return this.supportedCountryCodes().indexOf(this.currentUser.countryCode) !== -1;
  }

  getUserStatus() {
    let status = _.trim((this.currentUser.registration && this.currentUser.registration.status) || '') || 'initial';
    if ((this.currentUser.wallet && this.currentUser.wallet.address) && (status === 'initial')) {
      status = 'wallet-generated';
    }
    if ((this.currentUser.sponsor) && (!this.currentUser.sponsor.announcementTransactionConfirmed)) {
      status = 'waiting-sponsor';
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
