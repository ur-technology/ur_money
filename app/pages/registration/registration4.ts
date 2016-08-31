import {ViewChild, ElementRef, Inject} from '@angular/core';
import {Page, NavController, Platform, AlertController, ToastController} from 'ionic-angular';
import {REACTIVE_FORM_DIRECTIVES, FormGroup, FormControl, Validators} from '@angular/forms';
import {AngularFire} from 'angularfire2'
import * as _ from 'lodash';
import * as log from 'loglevel';

import {FocuserDirective} from '../../directives/focuser';
import {UserModel} from '../../models/user';
import {WalletModel} from '../../models/wallet';
import {AuthService} from '../../services/auth';
import {DeviceIdentityService} from '../../services/device-identity';
import {CustomValidator} from '../../validators/custom';
import {LoadingModalComponent} from '../../components/loading-modal/loading-modal';

import {Registration5Page} from './registration5';
import {HomePage} from '../home/home';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/registration/registration4.html',
  directives: [REACTIVE_FORM_DIRECTIVES, FocuserDirective]
})
export class Registration4Page {
  mainForm: FormGroup;
  errorMessage: string;
  countries: any[];
  country: any;
  allStates: any[];
  states: any[];
  state: any;
  profile: any;
  constructor(
    public nav: NavController,
    public auth: AuthService,
    public loadingModal: LoadingModalComponent,
    public deviceIdentityService: DeviceIdentityService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.countries = require('country-data').countries.all.sort((a, b) => {
      return (a.name < b.name) ? -1 : ((a.name == b.name) ? 0 : 1);
    });
    // remove Cuba, Iran, North Korea, Sudan, Syria
    this.countries = _.filter(this.countries, (country) => {
      return ['CU', 'IR', 'KP', 'SD', 'SY'].indexOf(country.alpha2) == -1;
    });
    this.allStates = require('provinces');
    let formElements: any = {
      firstName: new FormControl("", CustomValidator.nameValidator),
      middleName: new FormControl("", CustomValidator.optionalNameValidator),
      lastName: new FormControl("", CustomValidator.nameValidator),
      address: new FormControl("", CustomValidator.nameValidator),
      city: new FormControl("", CustomValidator.nameValidator),
      stateName: new FormControl("", CustomValidator.nameValidator),
      postalCode: new FormControl("", CustomValidator.nameValidator)
    };
    this.mainForm = new FormGroup(formElements);
    this.profile = _.pick(this.auth.currentUser, ['firstName', 'middleName', 'lastName', 'address', 'city', 'postalCode']);
    this.country = this.countries.find((x) => { return x.alpha2 == (this.auth.currentUser.countryCode || "US"); });
    this.countrySelected(this.auth.currentUser.stateCode, this.auth.currentUser.stateName);
  }

  countrySelected(initialStateCode?: string, initialStateName?: string) {
    this.profile.countryCode = this.country.alpha2;
    this.states = _.filter(this.allStates, (state) => { return state.country == this.profile.countryCode; });
    if (this.states.length > 0) {
      this.state = (initialStateCode && this.states.find((x) => { return x.short == initialStateCode; })) || this.states[0];
      delete this.profile.stateName;
      this.stateSelected();
    } else {
      this.state = undefined;
      delete this.profile.stateCode;
      this.profile.stateName = initialStateName || '';
    }
    this.mainForm.value.stateName = this.profile.stateName || '';
  }

  stateSelected() {
    this.profile.stateCode = this.state.short;
  }

  submit() {
    let newValues = _.merge(this.profile, {
      name: UserModel.fullName(this.profile),
      deviceIdentity: this.deviceIdentityService.deviceIdentity,
    });
    this.auth.currentUserRef.update(newValues).then(() => {
      _.merge(this.auth.currentUser, newValues);
      this.loadingModal.hide();
      this.nav.setRoot(Registration5Page);
    }).catch((error) => {
      this.loadingModal.hide();
      log.warn('unable to save address info');
    });
  };
}
