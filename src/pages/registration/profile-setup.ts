import { NavController} from 'ionic-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {UserModel} from '../../models/user';
import {AuthService} from '../../services/auth';
import {CustomValidator} from '../../validators/custom';
import {WalletSetupPage} from '../../pages/registration/wallet-setup';
import { Component } from '@angular/core';

@Component({
  templateUrl: 'profile-setup.html',
})
export class ProfileSetupPage {
  mainForm: FormGroup;
  errorMessage: string;
  countries: any[];
  profile: any;
  constructor(
    public nav: NavController,
    public auth: AuthService
  ) {
    this.profile = _.pick(this.auth.currentUser, ['firstName', 'lastName', 'middleName', 'email', 'countryCode', 'name']);
    if (_.isEmpty(_.trim(this.profile.name || ''))) {
      this.profile.name = `${this.auth.currentUser.firstName} ${this.auth.currentUser.lastName}`;
    }

    let formElements: any = {
      firstName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      lastName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      middleName: new FormControl(''),
      name: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      countryCode: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, CustomValidator.emailValidator])
    };
    this.mainForm = new FormGroup(formElements);
  }

  ionViewDidLoad() {
    this.fillCountriesArray();
  }

  onCountrySelected(countrySelected) {
    this.profile.countryCode = countrySelected.alpha2;
  }

  fillCountriesArray() {
    this.countries = require('country-data').countries.all.sort((a, b) => {
      return (a.name < b.name) ? -1 : ((a.name === b.name) ? 0 : 1);
    });
    // remove Cuba, Iran, North Korea, Sudan, Syria
    this.countries = _.filter(this.countries, (country) => {
      return ['CU', 'IR', 'KP', 'SD', 'SY'].indexOf(country.alpha2) === -1;
    });
    this.countries = _.filter(this.countries, { status: 'assigned' });

    let country = this.countries.find((x) => { return x.alpha2 === (this.auth.currentUser.countryCode || 'US'); });
    (<FormControl>this.mainForm.controls['countryCode']).setValue(country);
  }

  submit() {
    let newValues = _.merge(this.profile, {
      name: UserModel.fullName(this.profile)
    });
    newValues = _.omitBy(newValues, _.isUndefined);
    this.auth.currentUserRef.update(newValues).then(() => {
      _.merge(this.auth.currentUser, newValues);
      this.nav.setRoot(WalletSetupPage);
    }).catch((error) => {
      log.warn('unable to save profile info');
    });
  };
}
