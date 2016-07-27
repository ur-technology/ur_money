import {ViewChild} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators} from '@angular/common';
import {Page, NavController, Platform, Alert, Toast} from 'ionic-angular';
import * as _ from 'lodash';

import {CustomValidators} from '../../components/custom-validators/custom-validators';
import {Auth} from '../../components/auth/auth';
import {LoadingModal} from '../../components/loading-modal/loading-modal';
import {Focuser} from '../../components/focuser/focuser';

import {HomePage} from '../home/home';

@Page({
  templateUrl: 'build/pages/settings/settings.html',
})
export class SettingsPage {
  mainForm: ControlGroup;
  errorMessage: string;
  countries: any[];
  allStates: any[];
  states: any[];
  profile: any;
  constructor(
    public nav: NavController,
    public formBuilder: FormBuilder,
    public auth: Auth,
    public loadingModal: LoadingModal
  ) {
    this.countries = require('country-data').countries.all.sort((a, b) => {
      return (a.name < b.name) ? -1 : ((a.name == b.name) ? 0 : 1);
    });
    // remove Cuba, Iran, North Korea, Sudan, Syria
    this.countries = _.filter(this.countries, (country) => {
      return ['CU', 'IR', 'KP', 'SD', 'SY'].indexOf(country.alpha2) == -1;
    });
    this.allStates = require('provinces');
    this.mainForm = formBuilder.group({
      'firstName': ["", CustomValidators.nameValidator],
      'lastName': ["", CustomValidators.nameValidator],
      'stateName': ["", CustomValidators.nameValidator],
      'city': ["", CustomValidators.nameValidator]
    });
    let authUser = this.auth.currentUser;
    this.profile = {
      firstName: authUser.firstName || "",
      lastName: authUser.lastName || "",
      city: authUser.city,
      country: this.countries.find((x) => { return x.alpha2 == (authUser.countryCode || "US"); })
    };
    let defautStateName = (authUser.countryCode == this.profile.country.alpha2 && authUser.stateName) ? authUser.stateName : undefined;
    this.countrySelected(defautStateName);
  }

  countrySelected(defaultStateName) {
    this.profile.countryCode = this.profile.country.alpha2;
    this.states = _.filter(this.allStates, (state) => { return state.country == this.profile.country.alpha2; });
    if (this.states.length > 0) {
      this.profile.state = (defaultStateName && this.states.find((x) => { return x.name == defaultStateName; })) || this.states[0];
      this.stateSelected();
    } else {
      this.profile.state = undefined;
      this.profile.stateName = defaultStateName;
      this.mainForm.value.stateName = this.profile.stateName;
    }
  }

  stateSelected() {
    this.profile.stateName = this.profile.state ? this.profile.state.name : '';
  }

  submit() {
    this.saveProfile();
  }

  signOut() {
    this.auth.angularFire.auth.logout()
  }

  saveProfile() {
    let self = this;
    self.auth.currentUserRef.update({
      firstName: self.profile.firstName,
      lastName: self.profile.lastName,
      city: self.profile.city,
      stateName: self.profile.stateName,
      countryCode: self.profile.countryCode
    }).then(() => {
      let toast = Toast.create({ message: 'Your profile has been updated', duration: 2000, position: 'middle' });
      self.nav.present(toast);
      this.nav.setRoot(HomePage, {}, { animate: true, direction: 'back' });
    }).catch((error) => {
      console.log('unable to save profiel and wallet info!');
    });
  };

}
