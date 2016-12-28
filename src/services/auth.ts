import {Injectable, Inject} from '@angular/core';
import {AngularFire, FirebaseObjectObservable} from 'angularfire2';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {Subscription} from 'rxjs';
import {ContactsService} from '../services/contacts';
import {Config} from '../config/config';
import { FirebaseApp } from 'angularfire2';

@Injectable()
export class AuthService {
  public currentUserId: string;
  public currentUserRef: FirebaseObjectObservable<any>;
  public currentUser: any;
  public authenticationRequestCountryCode: string;
  public taskId: string;
  public firebaseConnectionCheckInProgress: boolean = false;

  constructor(
    public angularFire: AngularFire,
    public contactsService: ContactsService,
    @Inject(FirebaseApp) firebase: any
  ) {
  }

  respondToAuth(callback: any) {
    let self = this;
    self.checkFirebaseConnection().then(() => {
      firebase.auth().onAuthStateChanged((authData: any) => {
        if (authData) {
          self.currentUserId = authData.uid;
          self.currentUserRef = self.angularFire.database.object(`/users/${self.currentUserId}`);
          let userSubscription: Subscription = self.currentUserRef.subscribe((currentUser) => {
            if (userSubscription && !userSubscription.closed) {
              userSubscription.unsubscribe();
            }
            self.currentUser = currentUser;
            if (self.authenticationRequestCountryCode &&
              (!self.currentUser.countryCode || !self.currentUser.countryCode.match(/^[A-Z]{2}$/))) {
              self.currentUser.countryCode = self.authenticationRequestCountryCode;
              this.currentUserRef.update({ countryCode: self.currentUser.countryCode });
            }
            callback(undefined);
          });
        } else {
          // TODO: turn off all firebase listeners (on, once, subscribe, etc), such as in chat-list.ts and home.ts
          self.currentUserId = undefined;
          self.currentUserRef = undefined;
          self.currentUser = undefined;
          self.authenticationRequestCountryCode = undefined;
          callback(undefined);
        }
      });
    }, (error) => {
      callback(error);
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

    if (Config.targetPlatform === 'web') {
      return Promise.resolve();
    }

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
      }, 20 * 1000);
    });
  }

  requestAuthenticationCode(authParams: any) {
    let self = this;
    self.authenticationRequestCountryCode = authParams.countryCode;
    return new Promise((resolve, reject) => {
      let taskRef = firebase.database().ref('/phoneAuthQueue/tasks').push(
        _.omitBy(authParams, _.isNil)
      );
      taskRef.then(() => {
        self.taskId = taskRef.key;
        log.debug(`request queued to ${taskRef.toString()}`);
        let stateRef = taskRef.child('_state');
        stateRef.on('value', (snapshot) => {
          let state = snapshot.val();
          if (!_.includes([undefined, null, 'code_generation_in_progress'], state)) {
            stateRef.off('value');
            resolve(state);
          }
        });
      }, (error) => {
        reject(error);
      });
    });
  }

  checkAuthenticationCode(submittedAuthenticationCode: string): Promise<boolean> {
    let self = this;
    return new Promise((resolve, reject) => {
      if (!self.taskId) {
        reject(`no value set for taskId`);
        return;
      }

      let taskRef = firebase.database().ref(`/phoneAuthQueue/tasks/${self.taskId}`);
      taskRef.update({
        submittedAuthenticationCode: submittedAuthenticationCode,
        _state: 'code_matching_requested'
      }).then(() => {
        log.debug(`set submittedAuthenticationCode to ${submittedAuthenticationCode} at ${taskRef.toString()}`);
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
            taskRef.remove();
            this.taskId = undefined;
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

  isSignedIn() {
    return !!this.currentUser;
  }

  getUserStatus() {
    if (!this.currentUser) {
      return 'unauthenticated';
    }

    let status = _.trim((this.currentUser.registration && this.currentUser.registration.status) || '') || 'initial';
    if ((this.currentUser.wallet && this.currentUser.wallet.address) && (status === 'initial')) {
      status = 'wallet-generated';
    }
    if ((status !== 'initial') && (this.currentUser.sponsor) && (!this.currentUser.sponsor.announcementTransactionConfirmed)) {
      status = 'waiting-for-sponsor';
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

  referralLink(window): string {
    if (!this.currentUser) {
      return undefined;
    }
    let base: string;
    if (Config.targetPlatform === 'web') {
      base = window.location.origin;
    } else if (this.envMode() === 'production') {
      base = 'https://web.ur.technology';
    } else {
      base = 'https://ur-money-staging.firebaseapp.com';
    }
    return `${base}/r/${this.currentUser.referralCode}`;
  }
}
