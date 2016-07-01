import {Page, NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, AbstractControl, Control} from '@angular/common';
import {Auth} from '../../components/auth/auth';
import {Focuser} from '../../components/focuser/focuser';
import {FirebaseService} from '../../prelaunch_components/firebase-service/firebase-service';
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
    public firebaseService: FirebaseService
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
    var corePhone = this.signInForm.value.phone.replace(/\D/g,'');
    var phoneValue = "+" + ( /^664/.test(corePhone) ? "521" : "1" ) + corePhone
    window.localStorage.setItem("prelaunchPhone", phoneValue)
    this.firebaseService.lookupPrelaunchUserByPhone(phoneValue, this.nav, DashboardPage, SignUpPage, ErrorPage);
  }


}
