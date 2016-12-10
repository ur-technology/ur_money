import {Component, ViewChild, NgZone} from '@angular/core';
import {NavController, Platform, Content} from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {IdentityVerificationAddressPage} from '../identity-verification-address/identity-verification-address';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import {AuthService} from '../../../services/auth';
import {CustomValidator} from '../../../validators/custom';
import {DatePicker} from 'ionic-native';
import * as moment from 'moment';
import {Config} from '../../../config/config';

@Component({
  templateUrl: 'build/pages/identity-verification/identity-verification-personal-info/identity-verification-personal-info.html',
  pipes: [TranslatePipe]
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
    private platform: Platform,
    public auth: AuthService,
    private ngZone: NgZone
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
        'NiddleName': user.middleName || '',
        'FirstSurName': user.lastName || '',
        'DayOfBirth': '',
        'MonthOfBirth': '',
        'YearOfBirth': '',
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
      if (snapshot.exists() && snapshot.val().version === 2) {
        self.verificationArgs = snapshot.val();
        self.p = self.verificationArgs.PersonInfo;
        _.defaultsDeep(self.verificationArgs, defaultVerificationArgs);
        self.copyDobFromArgsToControl();
      }
    });
  }

  setDobControlValue(date) {
    if (date.isValid()) {
      let dateOfBirthControl: FormControl = <FormControl>this.mainForm.find('dateOfBirth');
      dateOfBirthControl.updateValue(date.format(this.targetPlatformWeb ? 'YYYY-MMM-DD' : 'MM/DD/YYYY'));
    }
  }

  setDobArgs(date) {
    if (date.isValid()) {
      this.verificationArgs.PersonInfo.YearOfBirth = moment(date).format('YYYY');
      this.verificationArgs.PersonInfo.MonthOfBirth = moment(date).format('MM');
      this.verificationArgs.PersonInfo.DayOfBirth = moment(date).format('DD');
    }
  }

  copyDobFromControlToArgs() {
    let dateOfBirthControl: FormControl = <FormControl>this.mainForm.find('dateOfBirth');
    this.setDobArgs(moment(dateOfBirthControl.value));
  }

  copyDobFromArgsToControl() {
    this.setDobControlValue(moment({
      year: this.verificationArgs.PersonInfo.YearOfBirth,
      month: this.verificationArgs.PersonInfo.MonthOfBirth,
      day: this.verificationArgs.PersonInfo.DayOfBirth
    }));
  }

  showDatePicker() {
    let self = this;
    let maxDate = moment(new Date()).subtract(16, 'years');

    if (!self.verificationArgs.PersonInfo.YearOfBirth) {
      let initialDate = maxDate.subtract(10, 'years');
      self.setDobArgs(initialDate);
      self.setDobControlValue(initialDate);
    }

    if (self.platform.is('cordova')) {
      let date = moment({
        year: this.verificationArgs.PersonInfo.YearOfBirth,
        month: this.verificationArgs.PersonInfo.MonthOfBirth,
        day: this.verificationArgs.PersonInfo.DayOfBirth
      });
      DatePicker.show({
        date: date.toDate(),
        mode: 'date',
        androidTheme: 3,
        maxDate: maxDate.valueOf(),
      }).then(date => {
        self.setDobArgs(date);
        self.setDobControlValue(date);
      });
    }
  }

  submit() {
    this.nav.push(IdentityVerificationAddressPage, {verificationArgs: this.verificationArgs});
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
