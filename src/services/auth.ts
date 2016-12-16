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
  public smsTaskId: string;
  public emailTaskId: string;
  public authenticatedEmail: string;
  public unauthenticatedEmail: string;
  public firebaseConnectionCheckInProgress: boolean = false;

  constructor(
    public angularFire: AngularFire,
    public contactsService: ContactsService,
    @Inject(FirebaseApp) firebase: any
  ) {
  }

  respondToAuth(app: any, pages: any) {
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
            app.initializeMenu();
            let status = self.getUserStatus();
            if (status === 'initial' || !self.currentUser.wallet || !self.currentUser.wallet.address) {
              app.nav.setRoot(pages.introPage);
            } else {
              self.contactsService.loadContacts(self.currentUserId, self.currentUser.phone, self.currentUser.countryCode);
              app.nav.setRoot(pages.homePage);
            }
          });
        } else {
          // TODO: turn off all firebase listeners (on, once, subscribe, etc), such as in chat-list.ts and home.ts
          self.currentUserId = undefined;
          self.currentUserRef = undefined;
          self.currentUser = undefined;
          self.authenticationRequestCountryCode = undefined;
          app.initializeMenu();
          app.nav.setRoot(pages.welcomePage);
        }
      });
    }, (error) => {
      if (error.messageKey === 'noInternetConnection') {
        app.nav.setRoot(pages.noInternetConnectionPage);
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

  requestSmsAuthenticationCode(phone: string, countryCode: string, referralCode: string) {
    let self = this;
    self.authenticationRequestCountryCode = countryCode;
    return new Promise((resolve, reject) => {
      let baseRef = firebase.database().ref('/smsAuthCodeGenerationQueue/tasks');
      self.smsTaskId = self.emailTaskId || baseRef.push().key;
      let taskRef = baseRef.child(self.smsTaskId);
      taskRef.set({ phone: phone, referralCode: referralCode || null }).then(() => {
        log.debug(`sms auth code request queued to ${taskRef.toString()}`);
        let stateRef = taskRef.child('_state');
        stateRef.on('value', (snapshot) => {
          let state = snapshot.val();
          if (_.includes([undefined, null, 'in_progress'], state)) {
            return;
          }

          stateRef.off('value');
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
      if (!self.smsTaskId) {
        reject(`no value set for smsTaskId`);
        return;
      }

      let taskRef = firebase.database().ref(`/smsAuthCodeMatchingQueue/tasks/${self.smsTaskId}`);
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
    firebase.database().ref(`/smsAuthCodeGenerationQueue/tasks/${this.smsTaskId}`).remove();
    firebase.database().ref(`/smsAuthCodeMatchingQueue/tasks/${this.smsTaskId}`).remove();
    if (this.emailTaskId) {
      firebase.database().ref(`/emailAuthCodeGenerationQueue/tasks/${this.emailTaskId}`).remove();
      firebase.database().ref(`/emailAuthCodeMatchingQueue/tasks/${this.emailTaskId}`).remove();
    }
    this.authenticatedEmail = undefined;
    this.unauthenticatedEmail = undefined;
    this.smsTaskId = undefined;
    this.emailTaskId = undefined;
  }

  requestEmailAuthenticationCode(email: string) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.unauthenticatedEmail = email;
      self.authenticatedEmail = undefined;
      let baseRef = firebase.database().ref('/emailAuthCodeGenerationQueue/tasks');
      self.emailTaskId = baseRef.push().key;
      let taskRef = baseRef.child(self.emailTaskId);
      taskRef.set({ email: email }).then(() => {
        log.debug(`email auth code request made at ${taskRef.toString}`);
        let stateRef = taskRef.child('_state');
        stateRef.on('value', (snapshot) => {
          let state = snapshot.val();
          if (_.includes([undefined, null, 'in_progress'], state)) {
            return;
          }

          stateRef.off('value');
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
      if (!self.emailTaskId) {
        reject(`no value set for emailTaskId`);
        return;
      }

      let taskRef = firebase.database().ref(`/emailAuthCodeMatchingQueue/tasks/${self.emailTaskId}`);
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

          // save info related to this email authentication for later
          self.authenticatedEmail = self.unauthenticatedEmail;
          self.unauthenticatedEmail = undefined;
          log.debug('Submitted authentication code was correct.');
          resolve(true);
        }, (error) => {
          log.debug('Error received during authentication: ${error}');
          resolve(false);
        });
      });
    });
  }

  isSignedIn() {
    return !!this.currentUser;
  }

  supportedCountries() {
    return {
      'AT': {
        name: 'Austria',
        CountryCode: 'AT',
        identificationTypes: {
          'Passport': 'Passport'
        },
        locationFieldNames: ['BuildingNumber', 'StreetName', 'City', 'PostalCode']
      },
      'AU': {
        name: 'Australia',
        CountryCode: 'AU',
        identificationTypes: {
          'DriverLicence': 'Driver Licence',
          'Passport': 'Passport'
        },
        locationFieldNames: ['BuildingNumber', 'StreetName', 'StreetType', 'UnitNumber', 'Suburb', 'StateProvinceCode', 'PostalCode']
      },
      'BE': {
        name: 'Belgium',
        CountryCode: 'BE',
        identificationTypes: {
          'Passport': 'Passport'
        },
        locationFieldNames: ['BuildingNumber', 'StreetName', 'City', 'PostalCode']
      },
      'DE': {
        name: 'Germany',
        CountryCode: 'DE',
        identificationTypes: {
          'Passport': 'Passport'
        },
        locationFieldNames: ['BuildingNumber', 'StreetName', 'City', 'PostalCode']
      },
      'DK': {
        name: 'Denmark',
        CountryCode: 'DK',
        identificationTypes: {
          'NationalId': 'National Id Number',
          'Passport': 'Passport'
        },
        locationFieldNames: ['BuildingNumber', 'StreetName', 'City', 'PostalCode']
      },
      'FR': {
        name: 'France',
        CountryCode: 'FR',
        identificationTypes: {
          'NationalId': 'Insee Number',
          'Passport': 'Passport'
        },
        locationFieldNames: ['BuildingNumber', 'StreetName', 'City', 'PostalCode']
      },
      'MX': {
        name: 'Mexico',
        CountryCode: 'MX',
        identificationTypes: {
          'NationalId': 'CURPID Number',
          'Passport': 'Passport'
        },
        locationFieldNames: ['Address1', 'PostalCode']
      },
      'MY': {
        name: 'Malaysia',
        CountryCode: 'MY',
        identificationTypes: {
          'NationalId': 'NRIC Number',
          'Passport': 'Passport'
        },
        locationFieldNames: ['Address1', 'City', 'PostalCode']
      },
      'NO': {
        name: 'Norway',
        CountryCode: 'NO',
        identificationTypes: {
          'Passport': 'Passport'
        },
        locationFieldNames: ['BuildingNumber', 'StreetName', 'City', 'PostalCode']
      },
      'NZ': {
        name: 'New Zealand',
        CountryCode: 'NZ',
        identificationTypes: {
          'DriverLicence': 'Driver Licence',
          'Passport': 'Passport'
        },
        locationFieldNames: ['BuildingNumber', 'StreetName', 'StreetType', 'UnitNumber', 'City', 'Suburb', 'PostalCode']
      },
      'ZA': {
        name: 'South Africa',
        CountryCode: 'ZA',
        identificationTypes: {
          'NationalId': 'National Id Number',
          'Passport': 'Passport'
        },
        locationFieldNames: ['Address1', 'City', 'Suburb', 'StateProvinceCode', 'PostalCode']
      },
      'SE': {
        name: 'Sweden',
        CountryCode: 'SE',
        identificationTypes: {
          'NationalId': 'PIN Number',
          'Passport': 'Passport'
        },
        locationFieldNames: ['BuildingNumber', 'StreetName', 'City', 'PostalCode']
      },
      'TR': {
        name: 'Turkey',
        CountryCode: 'TR',
        identificationTypes: {
          'Passport': 'Passport'
        },
        locationFieldNames: ['Address1', 'City', 'StateProvinceCode', 'PostalCode']
      },
      'GB': {
        name: 'United Kingdom',
        CountryCode: 'GB',
        identificationTypes: {
          'NationalId': 'NHS Number',
          'Passport': 'Passport'
        },
        locationFieldNames: ['BuildingNumber', 'StreetName', 'UnitNumber', 'BuildingName', 'City', 'PostalCode']
      },
      'US': {
        name: 'United States',
        CountryCode: 'US',
        identificationTypes: {
          'DriverLicence': 'Driver License',
          'NationalId': 'Social Security Number',
          'Passport': 'Passport'
        },
        locationFieldNames: ['BuildingNumber', 'StreetName', 'StreetType', 'UnitNumber', 'City', 'StateProvinceCode', 'PostalCode']
      }
    };
  }

  userCountryNotSupported() {
    let sanitizedCountryCode = _.trim(this.currentUser.countryCode || '');
    return sanitizedCountryCode && !this.supportedCountries()[sanitizedCountryCode];
  }

  locationFieldNames() {
    return ['BuildingNumber', 'StreetName', 'StreetType', 'UnitNumber', 'BuildingName', 'Address1', 'City', 'Suburb', 'StateProvinceCode', 'PostalCode'];
  }

  showLocationField(countryCode: string, fieldName: string) {
    if (fieldName === 'CountryCode') {
      return true;
    } else {
      let countryInfo = this.supportedCountries()[countryCode];
      return !!countryInfo && _.includes(countryInfo.locationFieldNames, fieldName);
    }
  }

  verificationArgsRef() {
    return firebase.database().ref(`/users/${this.currentUserId}/registration/verificationArgs`);
  }

  updateVerificationArgs(verificationArgs: any): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {

      // mark args with version
      verificationArgs.Version = 2;

      // first update args in memory
      self.currentUser.registration = self.currentUser.registration || {};
      self.currentUser.registration.verificationArgs = self.currentUser.registration.verificationArgs || {};
      _.extend(self.currentUser.registration.verificationArgs, verificationArgs);

      // then save args in db
      self.verificationArgsRef().update(verificationArgs).then(() => {
        resolve();
      }, (error) => {
        reject(error);
      });
    });
  }

  getUserStatus() {
    let status = _.trim((this.currentUser.registration && this.currentUser.registration.status) || '') || 'initial';
    if ((this.currentUser.wallet && this.currentUser.wallet.address) && (status === 'initial')) {
      status = 'wallet-generated';
    }
    if ((status !== 'initial') && (this.currentUser.sponsor) && (!this.currentUser.sponsor.announcementTransactionConfirmed)) {
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
    return `${base}?r=${this.currentUser.referralCode}`;
  }
}
