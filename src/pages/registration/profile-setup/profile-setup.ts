import { NavController} from 'ionic-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {AuthService} from '../../../services/auth';
import {CustomValidator} from '../../../validators/custom';
import {WalletSetupPage} from '../../../pages/registration/wallet-setup/wallet-setup';
import { Component } from '@angular/core';

@Component({
  selector: 'profile-setup-page',
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
    this.profile = _.pick(this.auth.currentUser, ['name', 'email']);
    if (_.isEmpty(_.trim(this.profile.name || ''))) {
      this.profile.name = `${this.auth.currentUser.firstName} ${this.auth.currentUser.lastName}`;
    }

    let formElements: any = {
      name: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
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
    this.countries = _.sortBy( require('country-data').countries.all, 'name');
    this.countries = _.reject(this.countries, { alpha2: ['CU', 'IR', 'KP', 'SD', 'SY'] });  // remove forbidden countries
    this.countries = _.filter(this.countries, { status: 'assigned' });

    let country = _.find( this.countries, { alpha2: this.auth.currentUser.countryCode || 'US' });
    (<FormControl>this.mainForm.controls['countryCode']).setValue(country);
  }

  submit() {
    this.profile = _.omitBy(this.profile, _.isUndefined);
    this.auth.currentUser.update(this.profile).then(() => {
      this.nav.push(WalletSetupPage);
    }).catch((error) => {
      log.warn('unable to save profile info');
    });
  };
}
