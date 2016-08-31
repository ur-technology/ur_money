import {ViewChild} from '@angular/core';
import {ControlGroup, Validators} from '@angular/common';
import {FormGroup, FormControl} from '@angular/forms';
import {Page, NavController, Platform, AlertController, ToastController} from 'ionic-angular';
import * as _ from 'lodash';
import * as log from 'loglevel';

import {UserModel} from '../../models/user';
import {CustomValidator} from '../../validators/custom';
import {AuthService} from '../../services/auth';
import {LoadingModalComponent} from '../../components/loading-modal/loading-modal';
import {FocuserDirective} from '../../directives/focuser';

import {HomePage} from '../home/home';

@Page({
  templateUrl: 'build/pages/settings/settings.html',
})
export class SettingsPage {
  mainForm: FormGroup;
  errorMessage: string;
  countries: any[];
  allStates: any[];
  states: any[];
  profile: any;
  constructor(
    public nav: NavController,
    public auth: AuthService,
    public loadingModal: LoadingModalComponent,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {

  }

  ionViewLoaded() {
    this.countries = require('country-data').countries.all.sort((a, b) => {
      return (a.name < b.name) ? -1 : ((a.name == b.name) ? 0 : 1);
    });
    // remove Cuba, Iran, North Korea, Sudan, Syria
    this.countries = _.filter(this.countries, (country) => {
      return ['CU', 'IR', 'KP', 'SD', 'SY'].indexOf(country.alpha2) == -1;
    });
    this.allStates = require('provinces');
    this.mainForm = new FormGroup({
      firstName: new FormControl("", CustomValidator.nameValidator),
      middleName: new FormControl("", CustomValidator.optionalNameValidator),
      lastName: new FormControl("", CustomValidator.nameValidator),
      stateName: new FormControl("", CustomValidator.nameValidator),
      city: new FormControl("", CustomValidator.nameValidator)
    });
    let authUser = this.auth.currentUser;
    this.profile = {
      firstName: authUser.firstName || "",
      middleName: authUser.middleName || "",
      lastName: authUser.lastName || "",
      city: authUser.city,
      country: this.countries.find((x) => { return x.alpha2 == (authUser.countryCode || "US"); })
    };
    let defaultStateName = (authUser.countryCode == this.profile.country.alpha2 && authUser.stateName) ? authUser.stateName : undefined;
    this.countrySelected(defaultStateName);
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
    let alert = this.alertCtrl.create({
      title: "Sign out?",
      buttons: [
        'Cancel']
    });
    alert.addButton({
      text: 'OK',
      handler: () => {
        this.auth.angularFire.auth.logout()
      }
    });
    alert.present();
  }

  saveProfile() {
    let self = this;
    let profile ={
      firstName: self.profile.firstName,
      middleName: self.profile.middleName,
      lastName: self.profile.lastName,
      name: UserModel.fullName(self.profile),
      city: self.profile.city,
      stateName: self.profile.stateName,
      countryCode: self.profile.countryCode
    };
    self.auth.currentUserRef.update(_.omitBy(profile, _.isNil)).then(() => {
      self.auth.loadCurrentUser();
      let toast = this.toastCtrl.create({ message: 'Your profile has been updated', duration: 3000, position: 'bottom' });
      toast.present();
      this.nav.setRoot(HomePage, {}, { animate: true, direction: 'back' });
    }).catch((error) => {
      log.warn('unable to save profile');
    });
  };

}
