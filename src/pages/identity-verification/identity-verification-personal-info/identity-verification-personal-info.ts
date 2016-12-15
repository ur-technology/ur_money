import {Component, ViewChild} from '@angular/core';
import {NavController, Platform, Content} from 'ionic-angular';
import {IdentityVerificationAddressPage} from '../identity-verification-address/identity-verification-address';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import {AuthService} from '../../../services/auth';
import {CustomValidator} from '../../../validators/custom';
import * as moment from 'moment';
import {Config} from '../../../config/config';

@Component({
  selector: 'identity-verification-personal-info-page',
  templateUrl: 'identity-verification-personal-info.html',
})
export class IdentityVerificationPersonalInfoPage {
  @ViewChild(Content) content: Content;
  mainForm: FormGroup;
  genders: any[];
  profile: any;
  targetPlatformWeb: boolean = Config.targetPlatform === 'web';
  verificationArgs: any;
  p: any;

  constructor(
    public nav: NavController,
    public platform: Platform,
    public auth: AuthService
  ) {
    let self = this;
    self.genders = [
      { name: 'Male', value: 'M' },
      { name: 'Female', value: 'F' }
    ];

    let formElements: any = {
      firstName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      lastName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      middleName: new FormControl(''),
      gender: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      dateOfBirth: new FormControl('', [Validators.required, CustomValidator.validateDateMoment])
    };
    self.mainForm = new FormGroup(formElements);

    let user = self.auth.currentUser;
    let defaultVerificationArgs = {
      'CountryCode': user.countryCode || 'US',
      'PersonInfo': {
        'FirstGivenName': user.firstName || '',
        'MiddleName': user.middleName || '',
        'FirstSurName': user.lastName || '',
        // 'DayOfBirth': '',
        // 'MonthOfBirth': '',
        // 'YearOfBirth': '',
        'Gender': ''
      },
      'Location': {},
      'IdentificationType': '',
      'NationalId': {},
      'DriverLicence': {},
      'Passport': {}
    };
    self.verificationArgs = defaultVerificationArgs;
    self.p = self.verificationArgs.PersonInfo;

    self.auth.verificationArgsRef().once('value').then((snapshot) => {
      let existingVerificationArgs = snapshot.val();
      if (existingVerificationArgs && existingVerificationArgs.Version === 2) {
        self.verificationArgs = existingVerificationArgs;
        _.defaultsDeep(self.verificationArgs, defaultVerificationArgs);
        self.copyDobFromArgsToControl();
      }
    });
  }

  setDobControlValue(date) {
    if (date.isValid()) {
      let dateOfBirthControl: FormControl = <FormControl>this.mainForm.get('dateOfBirth');
      dateOfBirthControl.setValue(date.toISOString());
    }
  }

  setDobArgs(date) {
    if (date.isValid()) {
      this.verificationArgs.PersonInfo.YearOfBirth = moment(date).year();
      this.verificationArgs.PersonInfo.MonthOfBirth = moment(date).month() + 1;
      this.verificationArgs.PersonInfo.DayOfBirth = moment(date).date();
    }
  }

  copyDobFromControlToArgs() {
    let dateOfBirthControl: FormControl = <FormControl>this.mainForm.get('dateOfBirth');
    this.setDobArgs(moment(dateOfBirthControl.value));
  }

  copyDobFromArgsToControl() {
    this.setDobControlValue(moment({
      year: _.toNumber(this.verificationArgs.PersonInfo.YearOfBirth),
      month: _.toNumber(this.verificationArgs.PersonInfo.MonthOfBirth) - 1,
      day: _.toNumber(this.verificationArgs.PersonInfo.DayOfBirth)
    }));
  }

  submit() {
    this.nav.push(IdentityVerificationAddressPage, { verificationArgs: this.verificationArgs });
  }

}
