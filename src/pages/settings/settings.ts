import {Component } from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import { NavController, AlertController, ToastController} from 'ionic-angular';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {CustomValidator} from '../../validators/custom';
import {AuthService} from '../../services/auth';
import {HomePage} from '../home/home';
import {TranslateService} from 'ng2-translate/ng2-translate';

@Component({
  templateUrl: 'settings.html',
})
export class SettingsPage {
  public mainForm: FormGroup;
  countries: any[];
  profile: any;

  constructor(
    public nav: NavController,
    public auth: AuthService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController, public translate: TranslateService
  ) {

    this.fillCountries();
    this.loadFormGroup();
  }

  private loadFormGroup() {
    let authUser = this.auth.currentUser;
    let chatNotificationsEnabled: boolean = authUser.settings && authUser.settings.chatNotifications;
    chatNotificationsEnabled = _.isUndefined(chatNotificationsEnabled) ? true : chatNotificationsEnabled;
    let transactionNotificationsEnabled: boolean = authUser.settings && authUser.settings.transactionNotifications;
    transactionNotificationsEnabled = _.isUndefined(transactionNotificationsEnabled) ? true : transactionNotificationsEnabled;

    this.mainForm = new FormGroup({
      firstName: new FormControl(authUser.firstName, [CustomValidator.nameValidator, Validators.required]),
      middleName: new FormControl(authUser.middleName , [CustomValidator.optionalNameValidator]),
      lastName: new FormControl(authUser.lastName , [CustomValidator.nameValidator, Validators.required]),
      name: new FormControl(authUser.name, [CustomValidator.nameValidator, Validators.required]),
      chatNotifications: new FormControl(chatNotificationsEnabled),
      transactionNotifications: new FormControl(transactionNotificationsEnabled),
      countryCode: new FormControl('', Validators.required),
    });

    let country = this.countries.find((x) => { return x.alpha2 === (authUser.countryCode || 'US'); });
    (<FormControl>this.mainForm.controls['countryCode']).setValue(country);
  }

  private fillCountries() {
    this.countries = require('country-data').countries.all.sort((a, b) => {
      return (a.name < b.name) ? -1 : ((a.name === b.name) ? 0 : 1);
    });
    // remove Cuba, Iran, North Korea, Sudan, Syria
    this.countries = _.filter(this.countries, (country) => {
      return ['CU', 'IR', 'KP', 'SD', 'SY'].indexOf(country.alpha2) === -1;
    });
  }

  ionViewDidEnter() {
    let Clipboard = require('clipboard');
    new Clipboard('#copy-button');
  }

  submit() {
    this.saveProfile();
  }

  signOut() {
    let alert = this.alertCtrl.create({
      title: this.translate.instant('signOut') + '?',
      buttons: [
        this.translate.instant('cancel')]
    });
    alert.addButton({
      text: this.translate.instant('ok'),
      handler: () => {
        this.auth.angularFire.auth.logout();
      }
    });
    alert.present();
  }

  saveProfile() {
    let self = this;
    let profile = {
      firstName: self.mainForm.value.firstName,
      lastName: self.mainForm.value.lastName,
      middleName: self.mainForm.value.middleName,
      name: self.mainForm.value.name,
      countryCode: self.mainForm.value.countryCode.alpha2,
      settings: {
        chatNotifications: self.mainForm.value.chatNotifications,
        transactionNotifications: self.mainForm.value.transactionNotifications
      }
    };
    self.auth.currentUser.update(_.omitBy(profile, _.isNil)).then(() => {
      let toast = this.toastCtrl.create({ message: this.translate.instant('settings.profileUpdated'), duration: 3000, position: 'bottom' });
      toast.present();
      this.nav.setRoot(HomePage);
    }).catch((error) => {
      log.warn('unable to save profile');
    });
  };
}
