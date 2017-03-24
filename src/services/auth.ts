import { Injectable, EventEmitter } from '@angular/core';
import { AngularFire } from 'angularfire2';
import * as _ from 'lodash';
import * as log from 'loglevel';
import { ContactsService } from '../services/contacts.service';
import { Config } from '../config/config';
import { BigNumber } from 'bignumber.js';
import { UserService } from './user.service';
import { UserModel } from '../models/user.model';
import * as firebase from 'firebase';

declare var trackJs: any;

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
    private userService: UserService  ) {
  }

  respondToAuth(callback: any) {
    let self = this;
    self.checkFirebaseConnection().then(() => {
      firebase.auth().onAuthStateChanged((authData: any) => {
        if (authData) {
          self.currentUserId = authData.uid;
          trackJs.addMetadata('user-phone', self.phone);
          trackJs.addMetadata('user-phone', self.email);
          trackJs.configure({ userId: self.currentUserId })

          this.userService.getCurrentUser(self.currentUserId).then(currentUser => {
            self.currentUser = currentUser;
            if (self.countryCode &&
              (!self.currentUser.countryCode || (self.currentUser.countryCode && !self.currentUser.countryCode.match(/^[A-Z]{2}$/)))) {
              self.currentUser.countryCode = self.countryCode;
              self.currentUser.update({ countryCode: self.currentUser.countryCode });
            }
            self.listenForWalletChange();
            callback(undefined);
          });


        } else {
          self.walletRef().off('value');
          self.phone = undefined;
          self.countryCode = undefined;
          self.email = undefined;
          self.currentUserId = undefined;
          self.currentUser = undefined;
          self.sponsorReferralCode = self.sponsorReferralCode ? _.clone(self.sponsorReferralCode) : undefined;
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

  public generateHashedPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let scryptAsync = require('scrypt-async');
      scryptAsync(password, 'saltnotneeded', { N: 16384, r: 16, p: 1, dkLen: 64, encoding: 'hex' }, (clientHashedPassword) => {
        resolve(clientHashedPassword);
      });
    });
  }

  requestSignUpCodeGeneration(phone: string, password: string, sponsorReferralCode: string, email: string): Promise<string> {
    let self = this;
    return new Promise((resolve, reject) => {
      if ((sponsorReferralCode && email) || (!sponsorReferralCode && !email)) {
        reject('expecting exactly one of sponsorReferralCode, email');
        return;
      }

      self.generateHashedPassword(password).then((clientHashedPassword: string) => {
        let taskRef = firebase.database().ref('/signUpQueue/tasks').push({
          phone: phone,
          clientHashedPassword: clientHashedPassword,
          sponsorReferralCode: sponsorReferralCode || null,
          email: email || null
        });
        taskRef.then(() => {
          self.taskId = taskRef.key;
          log.debug(`request queued to ${taskRef.toString()}`);
          let stateRef = taskRef.child('_state');
          stateRef.on('value', (snapshot) => {
            let state = snapshot.val();
            if (state && state !== 'code_generation_in_progress') {
              stateRef.off('value');
              resolve(state);
            }
          });
        }, (error) => {
          reject(error);
        });
      });
    });
  }

  signIn(phone: string, password: string) {
    return new Promise((resolve, reject) => {
      let taskRef;
      taskRef = firebase.database().ref('/signInQueue/tasks').push({
        phone: phone,
        clientHashedPassword: password
      });
      let resultRef = taskRef.child('result');
      resultRef.on('value', (snapshot) => {
        let result = snapshot.val();
        if (!result) {
          return;
        }
        resultRef.off('value');
        if (result.error) {
          reject(result.error);
          return;
        } else if (result.passwordMatch) {
          log.debug('Submitted authentication code was correct.');
          firebase.auth().signInWithCustomToken(result.authToken).then((authData) => {
            log.debug('Authentication succeded!');
            taskRef.remove();
            resolve(result.state);
          }).catch((error) => {
            taskRef.update({ authenticationError: error });
            log.warn('Unable to authenticate!');
            reject('Unable to authenticate');
          });
        } else {
          log.debug('Submitted authentication code was not correct.');
          taskRef.remove();
          resolve(result.state);
          return;
        }
      }, (error) => {
        reject(error);
      });
    });
  }

  checkSignUpCodeMatching(submittedAuthenticationCode: string): Promise<boolean> {
    let self = this;
    return new Promise((resolve, reject) => {
      if (!self.taskId) {
        reject(`no value set for taskId`);
        return;
      }

      let taskRef = firebase.database().ref(`/signUpQueue/tasks/${self.taskId}`);
      taskRef.update({
        submittedAuthenticationCode: submittedAuthenticationCode,
        _state: 'code_matching_requested'
      }).then(() => {
        let resultRef = taskRef.child('_state');
        resultRef.on('value', (snapshot) => {
          let state = snapshot.val();
          if (state && (state !== 'code_matching_requested') && (state !== 'code_matching_in_progress')) {
            resultRef.off('value');

            switch (state) {
              case 'code_matching_canceled_because_no_match':
                resolve(false);
                break;
              case 'code_matching_succeeded':
                taskRef.child('result').once('value', snapshot => {
                  let result = snapshot.val();
                  log.debug('Submitted authentication code was correct.');
                  firebase.auth().signInWithCustomToken(result.authToken).then((authData) => {
                    log.debug('Authentication succeded!');
                    taskRef.remove();
                    self.taskId = undefined;
                    resolve(true);
                  }).catch((error) => {
                    taskRef.update({ authenticationError: error });
                    log.warn('Unable to authenticate!');
                    reject('Unable to authenticate');
                  });
                });
                break;
            }
          }
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

  requestCheckTempCode(phone: string, tempCode: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let taskRef;
      taskRef = firebase.database().ref(`/signInQueue/tasks`)
        .push({ phone: phone, clientHashedPassword: tempCode, _state: 'sign_in_password_check_request' });
      let resultRef = taskRef.child('result');
      resultRef.on('value', (snapshot) => {
        let taskResult = snapshot.val();
        if (!taskResult) {
          return;
        }
        resultRef.off('value');
        if (taskResult.error) {
          reject(taskResult.error);
          return;
        } else {
          taskRef.remove();
          resolve(taskResult.state)
        }
      }, (error) => {
        reject(error);
      });
    });
  }

  requestChangeTempPassword(phone: string, tempPassword: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let taskRef;
      taskRef = firebase.database().ref(`/signInQueue/tasks`).push({ phone: phone, clientHashedPassword: tempPassword, _state: 'sign_in_password_change_request' });
      let resultRef = taskRef.child('result');
      resultRef.on('value', (snapshot) => {
        let taskResult = snapshot.val();
        if (!taskResult) {
          return;
        }
        resultRef.off('value');
        if (taskResult.error) {
          reject(taskResult.error);
          return;
        } else {
          taskRef.remove();
          resolve(taskResult.state)
        }
      }, (error) => {
        reject(error);
      });
    });
  }

  requestSignIn(phone: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let taskRef;
      taskRef = firebase.database().ref(`/signInQueue/tasks`).push({ phone: phone, _state: 'sign_in_requested' });
      let resultRef = taskRef.child('result');
      resultRef.on('value', (snapshot) => {
        let taskResult = snapshot.val();
        if (!taskResult) {
          return;
        }
        resultRef.off('value');
        if (taskResult.error) {
          reject(taskResult.error);
          return;
        } else {
          taskRef.remove();
          resolve(taskResult.state)
        }
      }, (error) => {
        reject(error);
      });

    });
  }

  sendRecoveryEmail(phone: string, email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const taskRef = firebase
        .database()
        .ref(`/resetPasswordQueue/tasks`)
        .push({
          _state: 'send_recovery_email_requested',
          phone,
          email
        });
      const resultRef = taskRef.child('result');

      resultRef.on('value', (snapshot) => {
        let taskResult = snapshot.val();

        if (!taskResult) {
          return;
        }

        resultRef.off('value');
        taskRef.remove();

        if (taskResult.error) {
          log.error(`send recovery email error: ${taskResult.error}`);
        }

        resolve(taskResult.state);
      }, (error) => {
        reject(error);
      });
    });
  }

  resetPasswordWithCode(resetCode: string, newPassword: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const taskRef = firebase
        .database()
        .ref(`/resetPasswordQueue/tasks`)
        .push({
          _state: 'reset_password_requested',
          resetCode,
          newPassword
        });
      const resultRef = taskRef.child('result');

      resultRef.on('value', (snapshot) => {
        let taskResult = snapshot.val();

        if (!taskResult) {
          return;
        }

        resultRef.off('value');
        taskRef.remove();

        if (taskResult.error) {
          log.error(`reset password error: ${taskResult.error}`);
        }

        resolve(taskResult.state);
      }, (error) => {
        reject(error);
      });
    });
  }

}
