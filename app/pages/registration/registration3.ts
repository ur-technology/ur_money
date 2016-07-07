import {Page, NavController, NavParams, Alert} from 'ionic-angular';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, AbstractControl, Control} from '@angular/common';
import {CustomValidators} from '../../components/custom-validators/custom-validators';
import {Auth} from '../../components/auth/auth';
import {LoadingModal} from '../../components/loading-modal/loading-modal';

@Page({
  templateUrl: 'build/pages/registration/registration3.html',
  directives: [FORM_DIRECTIVES]
})
export class Registration3Page {
  verificationCode: string;
  verificationKey: string;
  errorMessage: string;
  phone: string;

  constructor(public nav: NavController, public navParams: NavParams,
    public formBuilder: FormBuilder, public auth: Auth,
    public loadingModal: LoadingModal) {
    this.nav = nav;
    this.phone = this.navParams.get('phone');
    this.verificationCode = '';
    this.verificationKey = this.navParams.get('phoneVerificationKey');
  }

  submit() {
    this.loadingModal.show();
    // this.verificationCodeForm.value.verificationCode;
    this.auth.checkVerificationCode(this.verificationKey, this.verificationCode).then((success) => {
      this.loadingModal.hide();
      if (!success) {
        this.errorMessage = "The verification code you entered is incorrect or expired. Please try again.";
      }
    });
  }

  smsAgain() {
    this.loadingModal.show();
    this.auth.requestPhoneVerification(this.phone).then((result: any) => {
      this.loadingModal.hide();
      if (!result.smsSuccess) {
        console.log("error - sms could not be sent");
        this.showErrorAlert();
        return;
      } else {
        this.verificationKey = result.phoneVerificationKey;
        this.showSucessSMSAlert();
      }
    });
  }

  showSucessSMSAlert() {
    let alert = Alert.create({
      title: 'Success',
      message: 'Please use latest verification code.',
      buttons: ['Ok']
    });
    this.nav.present(alert);
  }

  showErrorAlert() {
    let alert = Alert.create({
      title: 'Error!',
      message: 'Error while sending sms. Please try again',
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
