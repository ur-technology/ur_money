import * as _ from 'lodash';
import * as log from 'loglevel';

import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import { AuthService } from '../../../services/auth';
import { CountryListService } from '../../../services/country-list';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

import { CustomValidator } from '../../../validators/custom';

import { HomePage } from '../../home/home';
import { ChangePasswordPage } from '../change-password/change-password';
import { ChangeEmailPage } from '../change-email/change-email';


@Component({
  selector: 'page-settings-account',
  templateUrl: 'settings-account.html'
})
export class SettingsAccountPage {
  mainForm: FormGroup;
  countries: any[];
  profile: any;
  pageName = 'SettingsAccountPage';

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    private countryListService: CountryListService,
    public toastCtrl: ToastController,
    public translate: TranslateService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    this.countries = this.countryListService.getCountryData();
    this.loadFormGroup();
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  private loadFormGroup() {
    let authUser = this.auth.currentUser;

    this.mainForm = new FormGroup({
      firstName: new FormControl(authUser.firstName, [CustomValidator.nameValidator, Validators.required]),
      middleName: new FormControl(authUser.middleName, [CustomValidator.optionalNameValidator]),
      lastName: new FormControl(authUser.lastName, [CustomValidator.nameValidator, Validators.required]),
      name: new FormControl(authUser.name, [CustomValidator.nameValidator, Validators.required]),
      countryCode: new FormControl('', Validators.required),
    });

    let country = this.countries.find((x) => { return x.countryCode === (authUser.countryCode || 'US'); });
    (<FormControl>this.mainForm.controls['countryCode']).setValue(country);
  }

  submit() {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Clicked on submit button', 'submit()');
    let profile: any = {
      firstName: self.mainForm.value.firstName,
      lastName: self.mainForm.value.lastName,
      middleName: self.mainForm.value.middleName,
      name: self.mainForm.value.name,
      countryCode: self.mainForm.value.countryCode.countryCode
    };

    self.auth.currentUser
      .update(_.omitBy(profile, _.isNil))
      .then((response) => {
        let toast = this.toastCtrl.create({ message: this.translate.instant('settings.profileUpdated'), duration: 3000, position: 'bottom' });
        toast.present();
        this.nav.setRoot(HomePage);
      })
      .catch((error) => {
        log.warn('unable to save profile');
      });
  }

  changeEmail() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on change email button', 'changeEmail()');
    this.nav.push(ChangeEmailPage);
  }

  changePassword() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on change password button', 'changePassword()');
    this.nav.push(ChangePasswordPage);
  }
}
