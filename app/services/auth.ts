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
  public alphaCountryCodeAssociatedWithPhone: string;
  public alphaCountryCodeIsoAssociatedWithPhone: string;
  public taskId: string;
  public authenticatedEmailTaskId: string;
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
            if (!self.currentUser.countryCode && self.alphaCountryCodeAssociatedWithPhone) {
              self.currentUser.countryCode = self.alphaCountryCodeAssociatedWithPhone;
              self.currentUser.countryCodeIso = self.alphaCountryCodeIsoAssociatedWithPhone;
              this.currentUserRef.update({ countryCode: self.currentUser.countryCode, countryCodeIso: self.currentUser.countryCodeIso });
            }
            let status = self.getUserStatus();
            if (status === 'initial') {
              nav.setRoot(pages.introPage);
            } else {
              self.contactsService.loadContacts(self.currentUserId, self.currentUser.phone, self.currentUser.countryCodeIso);
              nav.setRoot(pages.homePage);
            }
          });
        } else {
          // TODO: turn off all firebase listeners (on, once, subscribe, etc), such as in chat-list.ts and home.ts
          self.currentUserId = undefined;
          self.currentUserRef = undefined;
          self.currentUser = undefined;
          self.alphaCountryCodeAssociatedWithPhone = undefined;
          self.alphaCountryCodeIsoAssociatedWithPhone = undefined;
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

  requestSmsAuthenticationCode(phone: string, alphaCountryCodeAssociatedWithPhone: string, alphaCountryCodeIsoAssociatedWithPhone: string) {
    let self = this;
    self.alphaCountryCodeAssociatedWithPhone = alphaCountryCodeAssociatedWithPhone;
    self.alphaCountryCodeIsoAssociatedWithPhone = alphaCountryCodeIsoAssociatedWithPhone;
    return new Promise((resolve, reject) => {
      let baseRef = firebase.database().ref('/authenticationQueue/tasks');
      self.taskId = self.authenticatedEmailTaskId || baseRef.push().key;
      let taskRef = baseRef.child(self.taskId);
      taskRef.update({ _state: 'sms_code_generation_requested', phone: phone }).then((xxx) => {
        log.debug(`sms auth code request queued to /authenticationQueue/tasks/${self.taskId}`);
        let stateRef = taskRef.child('_state');
        stateRef.on('value', (snapshot) => {
          let state = snapshot.val();
          if (!_.includes([undefined, null, 'sms_code_generation_requested', 'sms_code_generation_in_progress'], state)) {
            stateRef.off('value');
            self.alphaCountryCodeAssociatedWithPhone = alphaCountryCodeAssociatedWithPhone;
            resolve(state);
          }
        });
      }, (error) => {
        reject(error);
      });
    });
  }

  requestEmailAuthenticationCode(email: string) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.authenticatedEmailTaskId = undefined;
      self.unauthenticatedEmail = email;
      let taskRef = firebase.database().ref(`/authenticationQueue/tasks/${self.taskId}`);
      taskRef.update({
        email: email,
        _state: 'email_code_generation_requested',
        _progress: null,
        _state_changed: firebase.database.ServerValue.TIMESTAMP
      }).then((xxx) => {
        log.debug(`email auth code request made at ${taskRef.toString}`);
        let stateRef = taskRef.child('_state');
        stateRef.on('value', (snapshot) => {
          let state = snapshot.val();
          if (!_.includes([undefined, null, 'email_code_generation_requested', 'email_code_generation_in_progress'], state)) {
            stateRef.off('value');
            resolve(state);
          }
        });
      }, (error) => {
        reject(error);
      });
    });
  }

  checkSmsAuthenticationCode(submittedSmsAuthenticationCode: string) {
    let self = this;
    return new Promise((resolve, reject) => {
      let taskRef = firebase.database().ref(`/authenticationQueue/tasks/${self.taskId}`);
      taskRef.update({
        submittedSmsAuthenticationCode: submittedSmsAuthenticationCode,
        _state: 'sms_code_matching_requested', // TODO: add rule that restricts client-initiated state change
        _progress: null,
        _state_changed: null,
        _id: null
      }).then((xxx) => {
        log.debug(`set submittedSmsAuthenticationCode to ${submittedSmsAuthenticationCode} at ${taskRef.toString()}`);
        let smsAuthenticationResultRef = taskRef.child('smsAuthenticationResult');
        smsAuthenticationResultRef.on('value', (snapshot) => {
          let smsAuthenticationResult = snapshot.val();
          if (!smsAuthenticationResult) {
            return;
          }
          smsAuthenticationResultRef.off('value');

          if (!smsAuthenticationResult.codeMatch) {
            log.debug('Submitted authentication code was not correct.');
            resolve({ codeMatch: false });
            return;
          }

          log.debug('Submitted authentication code was correct.');
          self.authenticatedEmailTaskId = undefined;
          firebase.auth().signInWithCustomToken(smsAuthenticationResult.authToken).then((authData) => {
            log.debug('Authentication succeded!');
            resolve({ codeMatch: true });
            taskRef.remove();
          }).catch((error) => {
            taskRef.update({ authenticationError: error });
            log.warn('Unable to authenticate!');
            reject('Unable to authenticate');
          });
        });
      });
    });
  }

  checkEmailAuthenticationCode(submittedEmailAuthenticationCode: string) {
    let self = this;
    return new Promise((resolve, reject) => {
      let taskRef = firebase.database().ref(`/authenticationQueue/tasks/${self.taskId}`);
      taskRef.update({
        submittedEmailAuthenticationCode: submittedEmailAuthenticationCode,
        _state: 'email_code_matching_requested' // TODO: add rule that restricts client-initiated state change
      }).then((xxx) => {
        log.debug(`set submittedEmailAuthenticationCode to ${submittedEmailAuthenticationCode} at ${taskRef.toString()}`);
        let emailAuthenticationResultRef = taskRef.child('emailAuthenticationResult');
        emailAuthenticationResultRef.on('value', (snapshot) => {
          let emailAuthenticationResult = snapshot.val();
          if (!emailAuthenticationResult) {
            return;
          }
          emailAuthenticationResultRef.off('value');

          if (!emailAuthenticationResult.codeMatch) {
            log.debug('Submitted authentication code was not correct.');
            resolve({ codeMatch: false });
            return;
          }

          log.debug('Submitted authentication code was correct.');
          // save this info related to this email authentication for later
          self.authenticatedEmailTaskId = self.taskId;
          self.authenticatedEmail = self.unauthenticatedEmail;
          self.unauthenticatedEmail = undefined;
          resolve({ codeMatch: true });
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
    return this.getSupportedCountryCodes().indexOf(this.currentUser.countryCodeIso) !== -1;
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
