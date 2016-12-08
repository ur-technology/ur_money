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
  profile: any;
  constructor(
    public nav: NavController,
    public auth: AuthService,
    public countryListService: CountryListService
  ) {
    this.profile = _.pick(this.auth.currentUser, ['streetName', 'buildingNumber', 'city', 'postalCode', 'countryCode', 'stateName', 'stateCode', 'suburb']);

    let formElements: any = {
      buildingNumber: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      streetName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      city: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      stateName: new FormControl('', Validators.required),
      postalCode: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      countryCode: new FormControl('', Validators.required),
      stateCode: new FormControl(''),
      suburb: new FormControl('')
    };
    this.mainForm = new FormGroup(formElements);
  }

  ionViewLoaded() {
    this.fillCountriesArray();
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

    let country = this.countries.find((x) => { return x.alpha2 === (this.auth.currentUser.countryCode || 'US'); });
    (<FormControl>this.mainForm.controls['countryCode']).updateValue(country);
  }



  fillStatesArray() {
    let allStates = require('provinces');
    this.states = _.filter(allStates, (state: any) => { return state.country === this.profile.countryCode; });
    let state = _.find(this.states, { 'name': this.auth.currentUser.stateName });

    if (this.states.length > 0) {
      state = state ? state : this.states[0];
      (<FormControl>this.mainForm.controls['stateName']).updateValue(state);
      this.onStateSelected(state);
    }
  }

  onCountrySelected(countrySelected) {
    this.profile.countryCode = countrySelected.alpha2;
    this.fillStatesArray();
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
