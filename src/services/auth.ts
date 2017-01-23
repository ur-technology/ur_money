import {Injectable, Inject, EventEmitter} from '@angular/core';
import {AngularFire} from 'angularfire2';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {ContactsService} from '../services/contacts.service';
import {Config} from '../config/config';
import { FirebaseApp } from 'angularfire2';
import {BigNumber} from 'bignumber.js';
import {UserService} from './user.service';
import {UserModel} from '../models/user.model';
import {DynamicLinkService} from './dynamic-link';

@Injectable()
export class AuthService {
  public sponsorReferralCode: string;
  public phone: string;
  public countryCode: string;
  public email: string;

  public currentUserId: string;
  public currentUser: UserModel;
  public taskId: string;
  public firebaseConnectionCheckInProgress: boolean = false;
  public walletChanged = new EventEmitter();

  constructor(
    public angularFire: AngularFire,
    public contactsService: ContactsService,
    private userService: UserService,
    private dynamicLinkService: DynamicLinkService,
    @Inject(FirebaseApp) firebase: any
  ) {
  }

  respondToAuth(callback: any) {
    let self = this;
    self.checkFirebaseConnection().then(() => {
      firebase.auth().onAuthStateChanged((authData: any) => {
        if (authData) {
          self.currentUserId = authData.uid;

          this.userService.getCurrentUser(self.currentUserId).then(currentUser => {
            self.currentUser = currentUser;
            if (self.countryCode &&
              (!self.currentUser.countryCode || !self.currentUser.countryCode.match(/^[A-Z]{2}$/))) {
              self.currentUser.countryCode = self.countryCode;
              self.currentUser.update({ countryCode: self.currentUser.countryCode });
            }
            if (self.currentUser && self.currentUser.referralCode) {
              this.dynamicLinkService.generateDynamicLink(self.currentUser.referralCode);
            }
            self.listenForWalletChange();
            callback(undefined);
          });


        } else {
          self.walletRef.walletRef().off('value');
          self.phone = undefined;
          self.countryCode = undefined;
          self.email = undefined;
          self.currentUserId = undefined;
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
      self.userService.getCurrentUser(self.currentUserId).then(currentUser => {
        self.currentUser = currentUser;
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

  listenForWalletChange() {
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

  requestPhoneRegistration() {
    let self = this;
    return new Promise((resolve, reject) => {
      let taskRef = firebase.database().ref('/phoneRegistrationQueue/tasks').push(
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
          if (!_.includes([undefined, null, 'sign_up_successful’'], state)) {
            stateRef.off('value');
            resolve(state);
          }
        });
      }, (error) => {
        reject(error);
      });
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
    if (this.currentUser.disabled && this.currentUser.disabled === true) {
      status = 'disabled';
    }

    return status;
  }

  envMode() {
    let matches = Config.firebaseProjectId.match(/ur-money-(\w+)/);
    return (matches && matches[1]) || 'unknown';
  }

  envModeDisplay() {
    let mode = this.envMode();
    return mode === 'production' ? '' : `${_.startCase(mode)} mode`;
  }

  referralLink(): string {
    if (!this.currentUser) {
      return undefined;
    }
    return this.dynamicLinkService.getGeneratedDynamicLink();
  }
}
