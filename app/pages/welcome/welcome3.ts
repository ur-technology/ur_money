import {Page, NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder,  ControlGroup, Validators, AbstractControl, Control} from '@angular/common';
import {Auth} from '../../components/auth/auth';
import {Welcome4Page} from './welcome4';
import * as _ from 'underscore';
import {CustomValidators} from '../../components/custom-validators/custom-validators';

@Page({
  templateUrl: 'build/pages/welcome/welcome3.html',
  directives: [FORM_DIRECTIVES]
})
export class Welcome3Page {
  phone: string;
  verificationCodeForm: ControlGroup;
  verificationCodeControl: AbstractControl;
  errorMessage: string;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public auth: Auth
  ) {
    this.nav = nav;
    this.phone = this.navParams.get('phone');
    this.verificationCodeForm = formBuilder.group({
      'verificationCode': ["", CustomValidators.phoneValidator]
    });
    this.verificationCodeControl = this.verificationCodeForm.controls['verificationCode'];
  }

  submit() {
    var verificationCode = this.verificationCodeForm.value.verificationCode;
    this.auth.checkVerificationCode(this.phone, verificationCode).then( (user) => {
      if (user) {
        this.nav.setRoot(Welcome4Page);
      } else {
        this.errorMessage = "The verification code you entered is incorrect or expired. Please try again.";
      }
    })
  }

}
