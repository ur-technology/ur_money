import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { NavController, NavParams, LoadingController } from 'ionic-angular';

import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { CustomValidator } from '../../../validators/custom';


@Component({
  selector: 'page-change-email',
  templateUrl: 'change-email.html'
})
export class ChangeEmailPage {

  mainForm: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private auth: AuthService,
    private toastService: ToastService,
    private loadingController: LoadingController,
    private translate: TranslateService
  ) {
    this.mainForm = new FormGroup({
      email: new FormControl('', [Validators.required, CustomValidator.emailValidator])
    });
  }

  submit() {
    if (this.mainForm.value.email === this.auth.currentUser.email) {
      return;
    }

    let loading = this.loadingController.create({content: this.translate.instant('pleaseWait')});
    loading.present();

    this.auth.currentUser
      .update({
        email: this.mainForm.value.email,
        isEmailVerified: false,
      })
      .then(() => {
        return this.auth.sendVerificationEmail(
          this.auth.currentUser.phone,
          this.auth.currentUser.email
        );
      })
      .then(taskState => {
        loading.dismiss();

        if (taskState === 'send_verification_email_finished') {
          this.toastService.showMessage({ messageKey: 'settings.emailUpdated' });
          this.navCtrl.pop();
        } else {
          this.toastService.showMessage({ messageKey: 'errors.unexpectedProblem' });
        }
      });
  }
}
