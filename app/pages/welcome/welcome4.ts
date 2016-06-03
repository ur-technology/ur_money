import {Page, NavController, NavParams} from 'ionic-angular';
import {FORM_DIRECTIVES, FormBuilder,  ControlGroup, Validators, AbstractControl, Control} from '@angular/common';
import {Auth} from '../../components/auth/auth';
// import {Welcome4Page} from './welcome5';
import * as _ from 'underscore';
import {CustomValidators} from '../../components/custom-validators/custom-validators';

@Page({
  templateUrl: '/build/pages/welcome/welcome4.html',
  directives: [FORM_DIRECTIVES]
})
export class Welcome4Page {

  verificationCodeForm: ControlGroup;
  verificationCodeControl: AbstractControl;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder
  ) {
    this.nav = nav;
    var phoneParam = this.navParams.get('phone');
    this.verificationCodeForm = formBuilder.group({
      'verificationCode': ["", CustomValidators.phoneValidator]
    });
    this.verificationCodeControl = this.verificationCodeForm.controls['verificationCode'];
  }

  signOut() {
    Auth.firebaseRef().unauth();
  }

}
