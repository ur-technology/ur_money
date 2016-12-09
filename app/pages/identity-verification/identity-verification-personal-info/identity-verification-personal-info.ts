import { Component, ViewChild, NgZone } from '@angular/core';
import { NavController, Platform, Content } from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {IdentityVerificationAddressPage} from '../identity-verification-address/identity-verification-address';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import * as log from 'loglevel';
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

  constructor(
    public nav: NavController,
    private platform: Platform,
    public auth: AuthService,
    private ngZone: NgZone
  ) {
    this.genders = [
      { name: 'Male', value: 'M' },
      { name: 'Female', value: 'F' }
    ];
    this.profile = _.pick(this.auth.currentUser, ['firstName', 'middleName', 'lastName', 'gender', 'dateOfBirth']);

    this.profile.dateOfBirth = _.trim(this.profile.dateOfBirth || '');
    let dateOfBirthControlValue = this.targetPlatformWeb ?
      moment(this.profile.dateOfBirth, 'MM/DD/YYYY').format('YYYY-MM-DD') :
      this.profile.dateOfBirth;
    let formElements: any = {
      firstName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      lastName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      middleName: new FormControl(''),
      gender: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      dateOfBirth: new FormControl(dateOfBirthControlValue, [Validators.required, CustomValidator.validateDateMoment])
    };
    this.mainForm = new FormGroup(formElements);
  }

  showDatePicker() {
    let self = this;
    let maxDate = moment(new Date()).subtract(16, 'years');
    let initialDate = self.profile.dateOfBirth ? moment(self.profile.dateOfBirth, 'MM/DD/YYYY') : maxDate.subtract(10, 'years');
    if (self.platform.is('cordova')) {
      DatePicker.show({
        date: initialDate.toDate(),
        mode: 'date',
        androidTheme: 3,
        maxDate: maxDate.valueOf(),
      }).then(date => {
        self.profile.dateOfBirth = moment(date).format('MM/DD/YYYY');
        self.ngZone.run(() => {
          let control: FormControl = <FormControl>self.mainForm.find('dateOfBirth');
          control.updateValue(self.profile.dateOfBirth);
        });
      });
    } else {
      let control: FormControl = <FormControl>self.mainForm.find('dateOfBirth');
      control.updateValue(initialDate.format('YYYY-MM-DD'));
    }
  }

  updateProfileDateOfBirth() {
    let control: FormControl = <FormControl>this.mainForm.find('dateOfBirth');
    let dateEntered = moment(control.value);
    this.profile.dateOfBirth = dateEntered.format('MM/DD/YYYY');
  }

  submit() {
    this.auth.currentUserRef.update(this.profile).then(() => {
      _.merge(this.auth.currentUser, this.profile);
      this.nav.push(IdentityVerificationAddressPage);
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
