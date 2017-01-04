import {Injectable, Inject, EventEmitter} from '@angular/core';
import {AngularFire, FirebaseObjectObservable} from 'angularfire2';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {Subscription} from 'rxjs';
import {ContactsService} from '../services/contacts';
import {Config} from '../config/config';
import { FirebaseApp } from 'angularfire2';
import {BigNumber} from 'bignumber.js';

@Injectable()
export class AuthService {
  public sponsorReferralCode: string;
  public phone: string;
  public countryCode: string;
  public email: string;

  public currentUserId: string;
  public currentUserRef: FirebaseObjectObservable<any>;
  public currentUser: any;
  public taskId: string;
  public firebaseConnectionCheckInProgress: boolean = false;
  public walletChanged = new EventEmitter();

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
            if (self.countryCode &&
              (!self.currentUser.countryCode || !self.currentUser.countryCode.match(/^[A-Z]{2}$/))) {
              self.currentUser.countryCode = self.countryCode;
              self.currentUserRef.update({ countryCode: self.currentUser.countryCode });
            }
            self.listenForWalletChange();
            callback(undefined);
          });
        } else {
          this.walletRef().off('value');
          self.phone = undefined;
          self.countryCode = undefined;
          self.email = undefined;
          self.currentUserId = undefined;
          self.currentUserRef = undefined;
          self.currentUser = undefined;
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

  currentBalanceWei() {
    let currentBalance = this.currentUser &&
    this.currentUser.wallet &&
    this.currentUser.wallet.currentBalance;
    return new BigNumber(currentBalance || 0);
  }

  currentBalanceUR() {
    return this.currentBalanceWei().dividedBy(1000000000000000000).round(2, BigNumber.ROUND_HALF_FLOOR);
  }

  announcementConfirmed() {
    return !!this.currentUser &&
      !!this.currentUser.wallet &&
      !!this.currentUser.wallet.announcementTransaction &&
      !!this.currentUser.wallet.announcementTransaction.blockNumber;
  }

  walletRef() {
    return firebase.database().ref(`/users/${this.currentUserId}/wallet`);
  }

  listenForWalletChange(){
    this.walletRef().on('value', snapshot => {
      this.currentUser.wallet = snapshot.val();
      this.walletChanged.emit({});
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
      }, 120 * 1000);
    });
  }

  requestAuthenticationCode() {
    let self = this;
    return new Promise((resolve, reject) => {
      let taskRef = firebase.database().ref('/phoneAuthQueue/tasks').push(
        {
          phone: this.phone,
          sponsorReferralCode: this.sponsorReferralCode || null,
          email: this.email || null
        }
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
    if(this.currentUser.disabled && this.currentUser.disabled === true){
      status = 'disabled';
    }

    return status;
  }

  envMode() {
    let matches = Config.firebaseProjectId.match(/ur-money-(\w+)/);
    return _.startCase(`${(matches && matches[1]) || 'unknown'} mode`);
  }

  envModeDisplay() {
    let mode = envMode();
    return mode === 'production' ? '' : mode;
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
