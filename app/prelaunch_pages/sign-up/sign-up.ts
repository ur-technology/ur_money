import {Page, NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, AbstractControl, Control} from '@angular/common';
import {Auth} from '../../components/auth/auth';
import {FirebaseService} from '../../prelaunch_components/firebase-service/firebase-service';
import {CustomValidators} from '../../components/custom-validators/custom-validators';
import * as _ from 'underscore'
import {DashboardPage} from '../dashboard/dashboard';
import {ErrorPage} from '../error/error';

@Page({
  templateUrl: 'build/prelaunch_pages/sign-up/sign-up.html'
})
export class SignUpPage {
  signUpForm: ControlGroup;
  firstName: AbstractControl;
  lastName: AbstractControl;
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

    this.user = navParams.get("user");
    var shortPhone = (this.user.phone || "").replace(/^(\+1|1)/,"");
    this.signUpForm = formBuilder.group({
      'firstName': ["", Validators.required],
      'lastName': ["", Validators.required],
      'phone': [shortPhone, CustomValidators.phoneValidator],
    });
    this.firstName = this.signUpForm.controls['firstName'];
    this.lastName = this.signUpForm.controls['lastName'];
    this.phone = this.signUpForm.controls['phone'];
    this.submissionInProgress = false;
  }

  signUp() {
    var thisPage = this;

    thisPage.submissionInProgress = true;
    this.user.firstName = thisPage.signUpForm.value.firstName;
    this.user.lastName = thisPage.signUpForm.value.lastName;
    let corePhone = thisPage.signUpForm.value.phone;
    this.user.phone = "+" + ( /^664/.test(corePhone) ? "52" : "1" ) + corePhone
    this.user.signedUpAt = Firebase.ServerValue.TIMESTAMP;

    this.firebaseService.saveUser(thisPage.user);

    // give firebase a second to recognize other recently assigned member ids
    setTimeout(() => {
      this.firebaseService.assignMemberId(thisPage.user, function(error, dummy) {
        if (error) {
          thisPage.nav.setRoot(ErrorPage, {message: "Could not assign member id."});
        } else {
          thisPage.nav.setRoot(DashboardPage, {user: thisPage.user});
        }
      });
    }, 1000);
  }


}
