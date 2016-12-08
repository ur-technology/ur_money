import { Component, ViewChild, NgZone } from '@angular/core';
import { NavController, Content } from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {IdentityVerificationAddressPage} from '../identity-verification-address/identity-verification-address';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {AuthService} from '../../../services/auth';
import {CustomValidator} from '../../../validators/custom';
import { DatePicker } from 'ionic-native';
import * as moment from 'moment';

@Component({
  templateUrl: 'build/pages/identity-verification/identity-verification-personal-info/identity-verification-personal-info.html',
  pipes: [TranslatePipe]
})
export class IdentityVerificationPersonalInfoPage {
  @ViewChild(Content) content: Content;
  mainForm: FormGroup;
  genders: any[];
  profile: any;
  constructor(
    public nav: NavController,
    public auth: AuthService,
    private ngZone: NgZone
  ) {
    this.genders = [
      { name: 'Male', value: 'M' },
      { name: 'Female', value: 'F' }
    ];
    this.profile = _.pick(this.auth.currentUser, ['firstName', 'middleName', 'lastName', 'gender', 'dateOfBirth']);

    let formElements: any = {
      firstName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      lastName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      middleName: new FormControl(''),
      gender: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      dateOfBirth: new FormControl('', [Validators.required, CustomValidator.validateDateMoment])
    };
    this.mainForm = new FormGroup(formElements);
  }

  showDatePicker() {
    let self = this;
    let maxDate = moment(new Date()).subtract(16, 'years');
    DatePicker.show({
      date: new Date(maxDate.year() - 10, 0, 1),
      mode: 'date',
      androidTheme: 3,
      maxDate: maxDate.valueOf(),
    }).then(
      date => {
        let dateMoment = moment(date);
        self.profile.dateOfBirth = dateMoment.format('MM/DD/YYYY');
        self.ngZone.run(() => {
          let control: FormControl = <FormControl>self.mainForm.find('dateOfBirth');
          control.updateValue(dateMoment.format('MM/DD/YYYY'));
        });
      });
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
