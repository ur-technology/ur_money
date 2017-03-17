import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
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
  private resetCode: string;
  mainForm: FormGroup;

  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    private auth: AuthService,
    private toastService: ToastService,
    private translate: TranslateService,
    private loadingController: LoadingController
  ) {
    this.resetCode = this.navParams.get('resetCode');
    this.mainForm = new FormGroup({
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
    const loadingModal = this.loadingController
      .create({
        content: this.translate.instant('pleaseWait')
      });
    
    loadingModal
      .present()
      .then(() => this.auth.generateHashedPassword(this.mainForm.value.password))
      .then((hashedPassword) => this.auth.resetPasswordWithCode(
        this.resetCode,
        hashedPassword,
      ))
      .then((taskState: string) => {
        loadingModal
          .dismiss()
          .then(() => {
            switch (taskState) {
              case 'reset_password_finished':
                this.toastService.showMessage({ messageKey: 'sign-in.passwordChanged' });
                this.navCtrl.setRoot(SignInPage);
                break;

              case 'reset_password_canceled_because_user_not_found':
                this.toastService.showMessage({ messageKey: 'sign-in.resetCodeNotFound'});
                break;

              case 'reset_password_canceled_because_user_disabled':
                this.toastService.showMessage({ messageKey: 'errors.userDisabled'});
                break;

              default:
                this.toastService.showMessage({ messageKey: 'errors.unexpectedProblem' });
            }
          });
      }, (error) => {
        loadingModal
          .dismiss()
          .then(() => {
            this.toastService.showMessage({ messageKey: 'errors.unexpectedProblem' });
          });
      });
  }
}
