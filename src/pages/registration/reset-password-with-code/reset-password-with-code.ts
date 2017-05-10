import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom';
import { ToastService } from '../../../services/toast';
import { AuthService } from '../../../services/auth';
import { SignInPage } from '../sign-in/sign-in';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

@Component({
  selector: 'page-reset-password-with-code',
  templateUrl: 'reset-password-with-code.html'
})
export class ResetPasswordWithCodePage {
  private resetCode: string;
  mainForm: FormGroup;
  pageName = 'ResetPasswordWithCodePage';

  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    private auth: AuthService,
    private toastService: ToastService,
    private loadingController: LoadingController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
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

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
  }

  submit() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Click on submit button', 'submit reset password info');
    const loadingModal = this.loadingController
      .create({
        content: "Please wait..."
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
                this.toastService.showMessage({ message: "Your password has been changed. For your security, please sign in with your new password." });
                this.navCtrl.setRoot(SignInPage);
                break;

              case 'reset_password_canceled_because_user_not_found':
                this.toastService.showMessage({ message: "The reset code that you entered did not match our records. Please double-check and try again."});
                break;

              case 'reset_password_canceled_because_user_disabled':
                this.toastService.showMessage({ message: 'Your user account has been disabled.'});
                break;

              case 'reset_password_canceled_because_email_not_verified':
                this.toastService.showMessage({ message: 'Your email is not verified. Please contact support@ur.technology.'});
                break;

              default:
                this.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
            }
          });
      }, (error) => {
        loadingModal
          .dismiss()
          .then(() => {
            this.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
          });
      });
  }
}
