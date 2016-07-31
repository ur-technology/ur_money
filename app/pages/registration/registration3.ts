import {Page, NavController, NavParams, Alert, Loading} from 'ionic-angular';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, AbstractControl, Control} from '@angular/common';
import {CustomValidators} from '../../validators/custom-validators';
import {Auth} from '../../services/auth';
import {LoadingModal} from '../../components/loading-modal/loading-modal';
import * as log from 'loglevel';

@Page({
  templateUrl: 'build/pages/registration/registration3.html',
  directives: [FORM_DIRECTIVES]
})
export class Registration3Page {
  verificationCode: string;
  phoneVerificationKey: string;
  errorMessage: string;
  phone: string;

  constructor(public nav: NavController, public navParams: NavParams,
    public formBuilder: FormBuilder, public auth: Auth,
    public loadingModal: LoadingModal) {
    this.nav = nav;
    this.phone = this.navParams.get('phone');
    this.verificationCode = '';
    this.phoneVerificationKey = this.navParams.get('phoneVerificationKey');
  }

  submit() {
    let loading = Loading.create({content: "Please wait...", dismissOnPageChange: true });
    this.nav.present(loading);
    // this.verificationCodeForm.value.verificationCode;
    this.auth.checkVerificationCode(this.phoneVerificationKey, this.verificationCode).then((success) => {
      loading.dismiss();
      if (!success) {
        this.verificationCode = '';
        this.showErrorAlert("The verification code you entered is incorrect or expired. Please try again.");
      }
    });
  }

  smsAgain() {
    this.verificationCode = '';
    let loading = Loading.create({content: "Please wait...", dismissOnPageChange: true });
    this.nav.present(loading);
    this.auth.requestPhoneVerification(this.phone).then((result: any) => {
      loading.dismiss();
      if (result.error) {
        log.warn(result.error);
        this.verificationCode = '';
        this.showErrorAlert("Sms could not be sent. Please try again later.");
      } else {
        this.phoneVerificationKey = result.phoneVerificationKey;
      }
    });
  }

  showErrorAlert(message) {
    // TODO: change this to toast message
    let alert = Alert.create({
      title: 'There was a problem...',
      message: message,
      buttons: ['Ok']
    });
    this.nav.present(alert);
  }

  add(number) {
    if (this.verificationCode.length < 6)
      this.verificationCode = `${this.verificationCode}${number}`;
  }

  delete() {
    if (this.verificationCode.length > 0) {
      this.verificationCode = this.verificationCode.substring(0, this.verificationCode.length - 1);
    }
  }

}
