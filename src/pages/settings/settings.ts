import {Component } from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
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
  errorMessage: string;
  countries: any[];
  profile: any;

  constructor(
    public nav: NavController,
    public auth: AuthService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController, public translate: TranslateService
  ) {

    this.countries = require('country-data').countries.all.sort((a, b) => {
      return (a.name < b.name) ? -1 : ((a.name === b.name) ? 0 : 1);
    });
    // remove Cuba, Iran, North Korea, Sudan, Syria
    this.countries = _.filter(this.countries, (country) => {
      return ['CU', 'IR', 'KP', 'SD', 'SY'].indexOf(country.alpha2) === -1;
    });

    let authUser = this.auth.currentUser;
    let chatNotificationsVal: boolean = authUser.settings && authUser.settings.chatNotifications;
    chatNotificationsVal = _.isUndefined(chatNotificationsVal) ? true : chatNotificationsVal;
    let transactionNotificationsVal: boolean = authUser.settings && authUser.settings.transactionNotifications;
    transactionNotificationsVal = _.isUndefined(transactionNotificationsVal) ? true : transactionNotificationsVal;

    this.mainForm = new FormGroup({
      firstName: new FormControl({ value: '', disabled: true }, CustomValidator.nameValidator),
      middleName: new FormControl({ value: '', disabled: true }, CustomValidator.optionalNameValidator),
      lastName: new FormControl({ value: '', disabled: true }, CustomValidator.nameValidator),
      wallet: new FormControl(authUser.wallet.address || ''),
      chatNotifications: new FormControl(chatNotificationsVal),
      transactionNotifications: new FormControl(transactionNotificationsVal)
    });

    this.profile = {
      firstName: authUser.firstName || '',
      middleName: authUser.middleName || '',
      lastName: authUser.lastName || '',
      country: this.countries.find((x) => { return x.alpha2 === (authUser.countryCode || 'US'); })
    };
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
      firstName: self.profile.firstName,
      middleName: self.profile.middleName,
      lastName: self.profile.lastName,
      countryCode: self.profile.countryCode,
      settings: {
        chatNotifications: this.mainForm.value.chatNotifications,
        transactionNotifications: this.mainForm.value.transactionNotifications
      }
    };
    self.auth.currentUserRef.update(_.omitBy(profile, _.isNil)).then(() => {
      self.auth.reloadCurrentUser();
      let toast = this.toastCtrl.create({ message: this.translate.instant('settings.profileUpdated'), duration: 3000, position: 'bottom' });
      toast.present();
      this.nav.setRoot(HomePage, {}, { animate: true, direction: 'back' });
    }).catch((error) => {
      log.warn('unable to save profile');
    });
  };
}
