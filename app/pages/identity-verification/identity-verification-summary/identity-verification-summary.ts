import { Component } from '@angular/core';
import {NavController, Platform, LoadingController, NavParams} from 'ionic-angular';
import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';
import {InAppPurchase} from 'ionic-native';
import {AuthService} from '../../../services/auth';
import {Config} from '../../../config/config';
import {IdentityVerificationFinishPage} from '../identity-verification-finish/identity-verification-finish';
import {VerificationFailedPage} from '../../registration/verification-failed';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';

@Component({
  templateUrl: 'build/pages/identity-verification/identity-verification-summary/identity-verification-summary.html',
  pipes: [TranslatePipe]
})
export class IdentityVerificationSummaryPage {
  verificationProductId: string = 'technology.ur.urmoneyapp.verify_identity';
  verificationArgs: any;
  identificationType: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  stripeCheckoutHandler: any;

  constructor(public nav: NavController, public loadingCtrl: LoadingController, public navParams: NavParams, private platform: Platform, public auth: AuthService, public translate: TranslateService) {
    this.verificationArgs = this.navParams.get('verificationArgs');
    if (this.verificationArgs.DataFields.DriverLicence) {
      this.identificationType = 'Driver License';
    } else if (this.verificationArgs.DataFields.NationalIds) {
      this.identificationType = 'National Id';
    } else if (this.verificationArgs.DataFields.Passport) {
      this.identificationType = 'Passport';
    }

    let dateMoment = moment(new Date(this.verificationArgs.DataFields.PersonInfo.YearOfBirth, this.verificationArgs.DataFields.PersonInfo.MonthOfBirth - 1, this.verificationArgs.DataFields.PersonInfo.DayOfBirth));
    this.dateOfBirth = dateMoment.format('MM/DD/YYYY');
    this.gender = this.verificationArgs.DataFields.PersonInfo.Gender === 'M' ? 'Male' : 'Female';
    let countries: any[] = require('country-data').countries.all;
    let countryObject = _.find(countries, ['alpha2', this.verificationArgs.DataFields.Location.Country]);
    this.country = countryObject.name;
  }

  ionViewLoaded() {
    if (Config.targetPlatform === 'web') {
      this.silenceStripeError();
      this.stripeCheckoutHandler = (<any>window).StripeCheckout.configure({
        key: 'pk_test_SruvvOMun2cNIrOfiSvBDM8a',
        locale: 'auto',
        email: this.auth.currentUser.email,
        token: (token: any) => {
          this.verifyWithTrulio(token.id);
        }
      });
    }
  }

  private silenceStripeError() {
    // TODO: Remove this hack once stripe fixes the bug described at
    //       http://stackoverflow.com/questions/36258252/stripe-json-circular-reference
    //       This hack is meant to work around stripe error "Converting circular structure to JSON"
    //       ...and it may have side-effects
    const _stringify = <any>JSON.stringify;
    JSON.stringify = function (value, ...args) {
      if (args.length) {
        return _stringify(value, ...args);
      } else {
        return _stringify(value, function (key, value) {
          if (value && key === 'zone' && value['_zoneDelegate']
              && value['_zoneDelegate']['zone'] === value) {
            return undefined;
          }
          return value;
        });
      }
    };
  }

  submit() {
    let self = this;

    if (self.platform.is('cordova')) {
      InAppPurchase.buy(
        self.verificationProductId
      ).then((data: any) => {
        InAppPurchase.consume(data.type, data.receipt, data.signature);
      }).then(() => {
        self.verifyWithTrulio();
      });
    } else if (Config.targetPlatform === 'web') {
      self.stripeCheckoutHandler.open({
        name: 'UR Money',
        description: 'Payment for Id Verification',
        amount: 299,
        zipCode: true,
        allowRememberMe: false
      });
    }
  }

  verifyWithTrulio(stripeTokenId?: string) {
    let self = this;
    let loader = self.loadingCtrl.create({
      content: self.translate.instant('pleaseWait'),
      dismissOnPageChange: true
    });
    loader.present();

    let task: any = {
      verificationArgs: self.verificationArgs,
      userId: self.auth.currentUserId
    };
    if (stripeTokenId) {
      task.stripeTokenId = stripeTokenId;
    }
    let taskRef = firebase.database().ref(`/identityVerificationQueue/tasks`).push(task);
    let resultRef = taskRef.child('result');
    log.debug(`waiting for value at ${resultRef.toString()}`);
    resultRef.on('value', (snapshot) => {
      // wait until result element appears on phoneLookupRef
      let result: any = snapshot.val();
      if (!result) {
        return;
      }
      resultRef.off('value');
      taskRef.remove();
      log.debug(`got value at ${resultRef.toString()}`, result);

      loader.dismiss().then(() => {
        self.auth.reloadCurrentUser().then(() => {
          if (self.auth.currentUser.registration.status === 'verification-succeeded') {
            loader.dismiss().then(() => {
              firebase.database().ref('/identityAnnouncementQueue/tasks').push({
                userId: this.auth.currentUserId
              });
              self.nav.popToRoot({ animate: false, duration: 0, transitionDelay: 0, progressAnimation: false }).then(() => {
                self.nav.push(IdentityVerificationFinishPage);
              });

            });
          } else {
            if (self.auth.currentUser.registration.status !== 'verification-pending') {
              console.log(`unexpected registration status ${self.auth.currentUser.registration.status}`);
            }

            loader.dismiss().then(() => {
              self.nav.popToRoot({ animate: false, duration: 0, transitionDelay: 0, progressAnimation: false }).then(() => {
                self.nav.push(VerificationFailedPage);
              });

            });

          }
        });
      });
    }, (error: any) => {
      loader.dismiss();
      log.warn(`unable to get match results: ${error}`);
    });
  }
}
