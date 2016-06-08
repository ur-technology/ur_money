import {IonicApp, Page, NavController, NavParams} from 'ionic-angular';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, AbstractControl, Control} from '@angular/common';
import {CustomValidators} from '../../components/custom-validators/custom-validators';
import {Auth} from '../../components/auth/auth';
import {TutorialPage} from '../tutorial/tutorial';

import {LoadingService} from '../../providers/loading-service/loading-service';

@Page({
  templateUrl: 'build/pages/welcome/welcome3.html',
  directives: [FORM_DIRECTIVES]
})
export class Welcome3Page {
  verificationCodeForm: ControlGroup;
  verificationCodeControl: AbstractControl;
  errorMessage: string;


  constructor(public loading: LoadingService,
    public nav: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public auth: Auth
  ) {
    this.nav = nav;
    this.verificationCodeForm = formBuilder.group({
      'verificationCode': ["", CustomValidators.verificationCodeValidator]
    });
    this.verificationCodeControl = this.verificationCodeForm.controls['verificationCode'];
  }

  submit() {
    this.loading.show();
    var verificationCode = this.verificationCodeForm.value.verificationCode;
    this.auth.checkVerificationCode(this.navParams.get('phoneVerificationKey'), verificationCode).then((success) => {
      this.loading.hide();
      if (!success) {
        this.errorMessage = "The verification code you entered is incorrect or expired. Please try again.";
      }
    });

    this.auth.authenticatedEmitter.subscribe(() => {
      this.loading.hide();
      this.nav.setRoot(TutorialPage);
    });
  }

}
