import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Content} from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {IdentityVerificationDocumentPage} from '../identity-verification-document/identity-verification-document';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import {AuthService} from '../../../services/auth';
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
  verificationArgs: any;
  l: any;
  formElements: any;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    public countryListService: CountryListService
  ) {
    let self = this;

    self.streetTypes = [
      { name: 'Street', value: 'St' },
      { name: 'Avenue', value: 'Av' },
      { name: 'Drive', value: 'Dr' },
      { name: 'Boulevard', value: 'Blvd' },
      { name: 'Road', value: 'Rd' },
      { name: 'Parkway', value: 'Pkwy' }
    ];

    this.verificationArgs = this.navParams.get('verificationArgs');
    self.l = self.verificationArgs.Location;
    this.formElements = {};
    this.formElements['countryCode'] = new FormControl('', Validators.required);
    _.each(self.auth.locationFieldNames(), (fieldName) => {
      this.formElements[_.lowerFirst(fieldName)] = new FormControl('', self.fieldValidator(fieldName));
    });
    self.mainForm = new FormGroup(this.formElements);
  }

  showLocationField(fieldName) {
    return this.auth.showLocationField(this.verificationArgs.CountryCode, fieldName);
  }

  private fieldValidator(fieldName) {
    let self = this;
    return (control) => {
      if (!control) {
        return;
      } else if (_.includes(['UnitNumber', 'BuildingName'], fieldName)) {
        return;
      }
      let value = control.value || '';
      if (_.isString(value) && !value.match(/\w+/)) {
        if (fieldName === 'CountryCode' || self.auth.showLocationField(self.verificationArgs.CountryCode, fieldName)) {
          return { 'invalidName': true };
        }
      }
    };
  }

  ionViewLoaded() {
    this.fillCountriesArray();
    this.fillStatesArray();
  }

  fillCountriesArray() {
    this.countries = _.values(this.auth.supportedCountries());
    let country = _.find(this.countries, { CountryCode: this.verificationArgs.CountryCode });
    this.formElements.countryCode.updateValue(country);
  }

  fillStatesArray() {
    if (!this.auth.showLocationField(this.verificationArgs.CountryCode, 'StateProvinceCode')) {
      return;
    }
    let allStates = require('provinces');
    this.states = _.filter(allStates, { country: this.verificationArgs.CountryCode });
    this.states = _.filter(this.states, 'short');
    let state = _.find(this.states, { 'short': this.verificationArgs.Location.StateProvinceCode }) ||
      this.states[0];
    this.verificationArgs.Location.StateProvinceCode = state ? state.short : '';
    this.formElements.stateProvinceCode.updateValue(state);
  }

  onCountrySelected(countrySelected) {
    this.verificationArgs.CountryCode = countrySelected.CountryCode;
    this.formElements.stateProvinceCode.updateValue(''); // this clears fields AND forces re-validation
    this.fillStatesArray();
    this.clearFormErrors();
  }

  clearFormErrors() {
    _.each(this.formElements, (control) => {
      control.setErrors(null);
    });
  }

  onStateSelected(state) {
    this.verificationArgs.Location.StateProvinceCode = state ? state.short : '';
  }

  submit() {
    this.nav.push(IdentityVerificationDocumentPage, {verificationArgs: this.verificationArgs});
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
