import {ViewChild, ElementRef, Inject} from '@angular/core';
import {Page, NavController, Platform, Alert, Toast} from 'ionic-angular';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators} from '@angular/common';
import {AngularFire} from 'angularfire2'
import * as _ from 'lodash';
import * as log from 'loglevel';

import {Focuser} from '../../directives/focuser';
import {Wallet} from '../../models/wallet';
import {Auth} from '../../services/auth';
import {DeviceIdentityService} from '../../services/device-identity-service';
import {CustomValidators} from '../../validators/custom-validators';
import {LoadingModal} from '../../components/loading-modal/loading-modal';

import {HomePage} from '../home/home';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/registration/registration4.html',
  directives: [FORM_DIRECTIVES, Focuser]
})
export class Registration4Page {
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
    public loadingModal: LoadingModal,
    public deviceIdentityService: DeviceIdentityService
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
      'city': ["", CustomValidators.nameValidator],
      'secretPhrase': ["", CustomValidators.secretPhraseValidator],
      'secretPhraseConfirmation': ["", Validators.required]
    }, { validator: CustomValidators.matchingSecretPhrases('secretPhrase', 'secretPhraseConfirmation') });
    let authUser = this.auth.currentUser;
    this.profile = {
      secretPhrase: '',
      secretPhraseConfirmation: '',
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

  suggestSecretPhrase() {
    var secureRandword = require('secure-randword');
    this.profile.secretPhrase = secureRandword(5).join(' ');;
    this.mainForm.controls['secretPhrase'].markAsDirty();
  }

  submit() {
    let alert = Alert.create({
      title: 'IMPORTANT! Write down your passphrase',
      message: "Write this five word paraphrase down and store it someplace safe. UR Capital does not store your pass phrase and will NOT be able to recover it if it is lost or forgotten.",
      //" If you lose your passphrase, you will not be able to access your money ever again. ?',
      buttons: [
        { text: 'Cancel', handler: () => { alert.dismiss(); } },
        {
          text: 'OK', handler: () => {
            alert.dismiss().then(() => {
              this.confirmSecretPhraseWrittenDown();
            });
          }
        }
      ]
    });

    this.nav.present(alert);
  }

  confirmSecretPhraseWrittenDown() {
    let alert = Alert.create({
      title: "Confirm you wrote down your passphrase",
      message: "If you lose your passphrase, you will not be able to access your money ever again. Did you write down your passphrase?",
      buttons: [
        { text: 'No', handler: () => { alert.dismiss(); } },
        {
          text: 'Yes', handler: () => {
            alert.dismiss().then(() => {
              this.generateAddress();
            });
          }
        }
      ]
    });
    this.nav.present(alert);
  }

  generateAddress() {
    let self = this;
    self.loadingModal.show();
    Wallet.generate(self.profile.secretPhrase, self.auth.currentUserId).then((walletData) => {
      let wallet: Wallet = new Wallet(walletData);
      self.profile.address = wallet.getAddress();
      self.saveProfile();
    }).catch((error) => {
      self.loadingModal.hide();
      log.warn('unable to get address!');
    });
  }

  saveProfile() {
    let self = this;
    let attrs = {
      firstName: self.profile.firstName,
      middleName: self.profile.middleName,
      lastName: self.profile.lastName,
      city: self.profile.city,
      stateName: self.profile.stateName,
      countryCode: self.profile.countryCode,
      deviceIdentity: self.deviceIdentityService.deviceIdentity,
      wallet: {
        address: self.profile.address,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      },
      signedUpAt: undefined
    };
    if (!self.auth.currentUser.signedUpAt) {
      attrs.signedUpAt = firebase.database.ServerValue.TIMESTAMP
    }
    self.auth.currentUserRef.update(_.omitBy(attrs, _.isNil)).then(() => {
      self.loadingModal.hide();
      let toast = Toast.create({
        message: 'Your account has been submitted for review. Once it is approved, you will receive 2,000 UR!',
        duration: 2000,
        position: 'middle'
      });
      self.nav.present(toast);
      self.nav.setRoot(HomePage);
    }).catch((error) => {
      self.loadingModal.hide();
      log.warn('unable to save profile and wallet info');
    });
  };
}
