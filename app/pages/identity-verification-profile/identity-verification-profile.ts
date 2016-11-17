import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {IdentityVerificationTrulioPage} from '../identity-verification-trulio/identity-verification-trulio';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {UserModel} from '../../models/user';
import {AuthService} from '../../services/auth';
import {CustomValidator} from '../../validators/custom';

@Component({
  templateUrl: 'build/pages/identity-verification-profile/identity-verification-profile.html',
  pipes: [TranslatePipe]
})
export class IdentityVerificationProfilePage {

  mainForm: FormGroup;
  errorMessage: string;
  countries: any[];
  states: any[];
  profile: any;
  constructor(
    public nav: NavController,
    public auth: AuthService
  ) {

    this.profile = _.pick(this.auth.currentUser, ['firstName', 'middleName', 'lastName', 'address', 'city', 'postalCode', 'countryCode', 'stateName']);
    this.profile.countryCode = 'US';

    let formElements: any = {
      address: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      city: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      stateName: new FormControl('', Validators.required),
      postalCode: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      country: new FormControl(this.profile.countryCode, Validators.required),
      stateCode: new FormControl('')
    };
    this.mainForm = new FormGroup(formElements);
    // this.fillCountriesArray();
    this.fillStatesArray();

  }

  fillCountriesArray() {
    this.countries = require('country-data').countries.all.sort((a, b) => {
      return (a.name < b.name) ? -1 : ((a.name === b.name) ? 0 : 1);
    });
    // remove Cuba, Iran, North Korea, Sudan, Syria
    this.countries = _.filter(this.countries, (country) => {
      return ['CU', 'IR', 'KP', 'SD', 'SY'].indexOf(country.alpha2) === -1;
    });
  }

  fillStatesArray() {
    let allStates = require('provinces');
    this.states = _.filter(allStates, (state: any) => { return state.country === this.profile.countryCode; });
    let state = _.find(this.states, { 'name': this.auth.currentUser.stateName });

    if (this.states.length > 0) {
      state = state ? state : this.states[0];
      (<FormControl>this.mainForm.controls['stateName']).updateValue(state);
      this.onStateSelected(state);
    } else {
      this.profile.stateName = '';
    }
  }

  onStateSelected(state) {
    (<FormControl>this.mainForm.controls['stateName']).updateValue(state);
    this.profile.stateName = state.name;
    if (state.short) {
      this.profile.stateCode = state.short;
    } else {
      delete this.profile.stateCode;
    }
  }

  submit() {
    let newValues = _.merge(this.profile, {
      name: UserModel.fullName(this.profile)
      // deviceIdentity: this.deviceIdentityService.deviceIdentity
    });
    this.auth.currentUserRef.update(newValues).then(() => {
      _.merge(this.auth.currentUser, newValues);
      this.nav.push(IdentityVerificationTrulioPage);
    }).catch((error) => {
      log.warn('unable to save address info');
    });
  };
}
