import {Page, NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, AbstractControl, Control} from '@angular/common';
import {Auth} from '../../components/auth/auth';
import {Focuser} from '../../components/focuser/focuser';
import {PrelaunchService} from '../../prelaunch_components/prelaunch-service/prelaunch-service';
import {CustomValidators} from '../../components/custom-validators/custom-validators';
import * as _ from 'underscore'
import {DashboardPage} from '../dashboard/dashboard';
import {SignUpPage} from '../sign-up/sign-up';
import {ErrorPage} from '../error/error';

@Page({
  directives: [Focuser],
  templateUrl: 'build/prelaunch_pages/sign-in/sign-in.html'
})
export class SignInPage {
  signInForm: ControlGroup;
  phone: AbstractControl;
  user: any;
  submissionInProgress: boolean;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public auth: Auth,
    public prelaunchService: PrelaunchService
  ) {

    this.signInForm = formBuilder.group({
      'phone': ["", CustomValidators.phoneValidator],
    });
    this.phone = this.signInForm.controls['phone'];
    this.submissionInProgress = false;
  }

  signIn() {
    var thisPage = this;
    thisPage.submissionInProgress = true;
    let normalizedPhone = CustomValidators.normalizedPhone(this.signInForm.value.phone);
    this.prelaunchService.lookupPrelaunchUserByPhone(normalizedPhone, this.nav, DashboardPage, SignUpPage, ErrorPage);
  }


}
