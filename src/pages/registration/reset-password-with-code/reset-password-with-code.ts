import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { ToastService } from '../../../services/toast';
import { AuthService } from '../../../services/auth';
import { SignInPage } from '../sign-in/sign-in';

@Component({
  selector: 'page-reset-password-with-code',
  templateUrl: 'reset-password-with-code.html'
})
export class ResetPasswordWithCodePage {
  mainForm: FormGroup;
  phone: string;

  constructor(
    public navCtrl: NavController,
    private auth: AuthService,
    private toastService: ToastService,
    private translate: TranslateService,
    private loadingController: LoadingController
  ) {
    this.mainForm = new FormGroup({
      resetCode: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(25)
      ]),
      passwordConfirmation: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(25)
      ])
    }, CustomValidator.isMatchingPassword);
  }

  submit() {
    let self = this;
    let loadingModal = self.loadingController.create({ content: self.translate.instant('pleaseWait') });
    
    loadingModal
      .present()
      .then(() => {
        return this.auth.generateHashedPassword(self.mainForm.value.password);
      })
      .then((hashedPassword) => {
        return this.auth.resetPasswordWithCode(
          self.mainForm.value.resetCode,
          hashedPassword,
        );
      })
      .then((taskState: string) => {
        loadingModal
          .dismiss()
          .then(() => {
            switch (taskState) {
              case 'reset_password_finished':
                self.toastService.showMessage({ messageKey: 'sign-in.resetPassword' });
                self.navCtrl.setRoot(SignInPage);
                break;
              case 'reset_password_canceled_because_user_not_found':
                self.toastService.showMessage({ messageKey: 'sign-in.resetCodeNotFound'});
                break;
              case 'reset_password_canceled_because_user_disabled':
                self.toastService.showMessage({ messageKey: 'sign-in.userDisabled'});
                break;
              default:
                self.toastService.showMessage({ messageKey: 'sign-in.unexpectedProblem' });
            }
          })
      }, (error) => {
        loadingModal
          .dismiss()
          .then(() => {
            self.toastService.showMessage({ messageKey: 'sign-in.unexpectedProblem' });
          });
      });
  }
}
