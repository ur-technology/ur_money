import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom';
import { ToastService } from '../../../services/toast';
import { AuthService } from '../../../services/auth';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

@Component({
  selector: 'page-lost-password',
  templateUrl: 'lost-password.html'
})
export class LostPasswordPage {
  mainForm: FormGroup;
  phone: string;
  pageName = 'LostPasswordPage';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingController: LoadingController,
    private toastService: ToastService,
    private auth: AuthService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    this.mainForm = new FormGroup({ email: new FormControl('', [Validators.required, CustomValidator.emailValidator]) });
    this.phone = this.navParams.get('phone');
  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
  }

  submit() {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Click on submit', 'submit lost password info');
    let loadingModal = self.loadingController.create({ content: "Please wait..." });

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
                self.toastService.showMessage({ message: "A recovery email has been sent to the email address you provided. Please follow the instructions" });
                break;

              case 'send_recovery_email_canceled_because_user_not_found':
                self.toastService.showMessage({ message: 'The email that you entered did not match our records. Please double-check and try again.' });
                break;

              case 'send_recovery_email_canceled_because_user_disabled':
                self.toastService.showMessage({ message: 'Your user account has been disabled.' });
                break;

              case 'send_recovery_email_canceled_because_email_not_verified':
                self.toastService.showMessage({ message: 'Your email is not verified. Please contact support@ur.technology.' });
                break;

              default:
                self.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
            }
          });
      }, (error) => {
        self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Error catch. unexpected Problem', 'error submit lost password info');
        loadingModal
          .dismiss()
          .then(() => {
            self.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
          });
      });
  }


}
