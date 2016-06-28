import {Page, NavController, NavParams} from 'ionic-angular';
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

  errorMessage: string;
  phone: string;

  constructor(public nav: NavController, public navParams: NavParams,
    public formBuilder: FormBuilder, public auth: Auth,
    public loadingModal: LoadingModal) {
    this.nav = nav;
    this.phone = this.navParams.get('phone');
    this.verificationCode = '';
  }

  submit() {
    this.loadingModal.show();
    // this.verificationCodeForm.value.verificationCode;
    this.auth.checkVerificationCode(this.navParams.get('phoneVerificationKey'), this.verificationCode).then((success) => {
      this.loadingModal.hide();
      if (!success) {
        this.errorMessage = "The verification code you entered is incorrect or expired. Please try again.";
      }
    });
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
