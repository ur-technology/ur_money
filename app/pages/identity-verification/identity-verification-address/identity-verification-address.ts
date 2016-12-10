import { Component, ViewChild } from '@angular/core';
import { NavController, Content } from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {IdentityVerificationDocumentPage} from '../identity-verification-document/identity-verification-document';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {AuthService} from '../../../services/auth';
import {CustomValidator} from '../../../validators/custom';
import {CountryListService} from '../../../services/country-list';

@Component({
  templateUrl: 'build/pages/identity-verification/identity-verification-address/identity-verification-address.html',
  pipes: [TranslatePipe]
})
export class IdentityVerificationAddressPage {
  @ViewChild(Content) content: Content;
  mainForm: FormGroup;
  errorMessage: string;
  countries: any[];
  states: any[];
  streetTypes: any[];
  profile: any;
  constructor(
    public nav: NavController,
    public auth: AuthService,
    public countryListService: CountryListService
  ) {

    this.streetTypes = [
      { name: 'Street', value: 'St' },
      { name: 'Avenue', value: 'Av' },
      { name: 'Drive', value: 'Dr' },
      { name: 'Boulevard', value: 'Blvd' },
      { name: 'Road', value: 'Rd' },
      { name: 'Parkway', value: 'Pkwy' }
    ];

    this.profile = _.pick(this.auth.currentUser, this.auth.locationFieldNames());
    if (!this.profile.countryCode) {
      this.profile.countryCode = 'US';
    }
    let formElements: any = {};
    _.each(this.auth.locationFieldNames(), (fieldName) => {
      formElements[fieldName] = new FormControl('', this.fieldValidator(fieldName));
    });
    this.mainForm = new FormGroup(formElements);
  }

  showField(fieldName) {
    return this.auth.showLocationField(this.profile.countryCode, fieldName);
  }

  private fieldValidator(fieldName) {
    let self = this;
    return (control) => {
      if (_.includes(['unitNumber', 'buildingName'], fieldName)) {
        return;
      }
      if (self.auth.showLocationField(this.profile.countryCode, fieldName) &&
        control &&
        _.isString(control.value) &&
        !control.value.match(/\w+/)) {
        return { 'invalidName': true };
      }
    };
  }

  ionViewLoaded() {
    this.fillCountriesArray();
    this.fillStatesArray();
  }

  fillCountriesArray() {
    this.countries = _.values(this.auth.supportedCountries());
    let country = this.countries.find((x) => { return x.countryCode === (this.auth.currentUser.countryCode || 'US'); });
    (<FormControl>this.mainForm.controls['countryCode']).updateValue(country);
  }

  fillStatesArray() {
    if (!this.auth.showLocationField(this.profile.countryCode, 'stateCode')) {
      return;
    }
    let allStates = require('provinces');
    this.states = _.filter(allStates, (state: any) => { return state.country === this.profile.countryCode; });
    let state = _.find(this.states, { 'short': this.auth.currentUser.stateCode });
    if (this.states.length > 0) {
      state = state ? state : this.states[0];
      this.onStateSelected(state);
    }
  }

  onCountrySelected(countrySelected) {
    this.profile.countryCode = countrySelected.countryCode;
    this.fillStatesArray();
  }

  onStateSelected(state) {
    this.profile.stateCode = state.short;
  }

  submit() {
    this.auth.currentUserRef.update(this.profile).then(() => {
      _.merge(this.auth.currentUser, this.profile);
      this.nav.push(IdentityVerificationDocumentPage);
    }).catch((error) => {
      log.warn('unable to save address info');
    });
  }

  focusInput() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 500);
  }

}
