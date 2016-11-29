import { Component } from '@angular/core';
import { NavController, LoadingController, NavParams} from 'ionic-angular';
import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';
import {InAppPurchase} from 'ionic-native';
import {AuthService} from '../../../services/auth';
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
  summaryData: any;
  identificationType: string;
  dateOfBirth: string;
  gender: string;
  country: string;

  constructor(public nav: NavController, public loadingCtrl: LoadingController, public navParams: NavParams, public auth: AuthService, public translate: TranslateService) {
    this.summaryData = this.navParams.get('summaryData');
    if (this.summaryData.verificationArgs.DataFields.DriverLicence) {
      this.identificationType = 'Driver License';
    } else if (this.summaryData.verificationArgs.DataFields.NationalIds) {
      this.identificationType = 'National Id';
    } else if (this.summaryData.verificationArgs.DataFields.Passport) {
      this.identificationType = 'Passport';
    }

    let dateMoment = moment(new Date(this.summaryData.verificationArgs.DataFields.PersonInfo.YearOfBirth, this.summaryData.verificationArgs.DataFields.PersonInfo.MonthOfBirth - 1, this.summaryData.verificationArgs.DataFields.PersonInfo.DayOfBirth));
    this.dateOfBirth = dateMoment.format('MM/DD/YYYY');
    this.gender = this.summaryData.verificationArgs.DataFields.PersonInfo.Gender === 'M' ? 'Male' : 'Female';
    let countries: any[] = require('country-data').countries.all;
    let countryObject = _.find(countries, ['alpha2', this.summaryData.verificationArgs.DataFields.Location.Country]);
    this.country = countryObject.name;
  }

  nationalIdPlaceholder() {
    if (this.auth.currentUser.countryCode === 'US') {
      return 'Social Security Number';
    } else if (this.auth.currentUser.countryCode === 'CA') {
      return 'Social Insurance Number';
    } else if (this.auth.currentUser.countryCode === 'MX') {
      return 'Número de Credencial de Elector';
    } else {
      return 'National Id Number';
    }
  }

  ionViewLoaded() {

  }

  submit() {
    let self = this;

    InAppPurchase
      .buy(self.verificationProductId)
      .then((data: any) => {
        InAppPurchase.consume(data.type, data.receipt, data.signature);
      })
      .then(() => {
        self.verifyWithTrulio();
      });

  }

  verifyWithTrulio() {
    let self = this;
    let loader = self.loadingCtrl.create({
      content: self.translate.instant('pleaseWait'),
      dismissOnPageChange: true
    });
    loader.present();

    let taskRef = firebase.database().ref(`/identityVerificationQueue/tasks`).push(self.summaryData);
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
