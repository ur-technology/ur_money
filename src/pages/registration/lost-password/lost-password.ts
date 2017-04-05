import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom';
import { ResetPasswordWithCodePage } from '../reset-password-with-code/reset-password-with-code';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { ToastService } from '../../../services/toast';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'page-lost-password',
  templateUrl: 'lost-password.html'
})
export class LostPasswordPage {
  mainForm: FormGroup;
  phone: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingController: LoadingController,
    private translate: TranslateService,
    private toastService: ToastService,
    private auth: AuthService
  ) {
    this.mainForm = new FormGroup({ email: new FormControl('', [Validators.required, CustomValidator.emailValidator]) });
    this.phone = this.navParams.get('phone');
  }

  submit() {
    let self = this;
    let loadingModal = self.loadingController.create({ content: self.translate.instant('pleaseWait') });

    loadingModal
      .present()
      .then(() => {
        return self.auth.sendRecoveryEmail(self.phone, self.mainForm.value.email);
      })
      .then((taskState: string) => {
        loadingModal
          .dismiss()
          .then(() => {
            switch (taskState) {
              case 'send_recovery_email_finished':
                self.toastService.showMessage({ messageKey: 'sign-in.sentRecoveryEmail' });
                self.navCtrl.setRoot(ResetPasswordWithCodePage);
                break;

              case 'send_recovery_email_canceled_because_user_not_found':
                self.toastService.showMessage({ messageKey: 'errors.emailNotFound'});
                break;

              case 'send_recovery_email_canceled_because_user_disabled':
                self.toastService.showMessage({ messageKey: 'errors.userDisabled'});
                break;

              case 'send_recovery_email_canceled_because_email_not_verified':
                self.toastService.showMessage({ messageKey: 'errors.emailNotVerified'});
                break;

              default:
                self.toastService.showMessage({ messageKey: 'errors.unexpectedProblem' });
            }
          });
      }, (error) => {
        loadingModal
          .dismiss()
          .then(() => {
            self.toastService.showMessage({ messageKey: 'errors.unexpectedProblem' });
          });
      });
  }


}
