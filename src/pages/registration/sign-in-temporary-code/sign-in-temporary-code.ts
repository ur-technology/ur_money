import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { ToastService} from '../../../services/toast';
import { ResetPasswordPage } from '../reset-password/reset-password';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

@Component({
  selector: 'page-sign-in-temporary-code',
  templateUrl: 'sign-in-temporary-code.html'
})
export class SignInTemporaryCodePage {
  mainForm: FormGroup;
  phone: string;
  pageName = 'SignInTemporaryCodePage';

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthService, private toastService: ToastService, private loadingController: LoadingController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    this.mainForm = new FormGroup({ code: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)]) });
    this.phone = this.navParams.get('phone');
  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
  }

  submit() {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Clicked on submit code button', `Phone: ${self.phone} - submit()`);
    let task: string;
    let loadingModal = self.loadingController.create({ content: "Please wait..." });

    loadingModal.present().then(() => {
      return self.auth.requestCheckTempCode(self.phone, self.mainForm.value.code)
    }).then((newTask: string) => {
      task = newTask;
      return loadingModal.dismiss();
    }).then(() => {
      switch (task) {
        case 'request_check_temp_password_succeded':
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Submited code succeded. Go to ResetPasswordPage', `Phone: ${self.phone} - submit()`);
          self.navCtrl.setRoot(ResetPasswordPage, {phone: self.phone});
          break;
        case 'request_check_temp_password_canceled_because_wrong_password':
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Wrong code submited', `Phone: ${self.phone} - submit()`);
          self.toastService.showMessage({ message: "The number and password that you entered did not match our records. Please double-check and try again."});
          break;
        case 'request_check_temp_password_canceled_because_user_not_found':
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'User not found', `Phone: ${self.phone} - submit()`);
          self.toastService.showMessage({ message: 'Your user account has been disabled.' });
          break;
        default:
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Unexpected Problem', `Phone: ${self.phone} - submit()`);
          self.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
      }
    }, (error) => {
      self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Unexpected Problem', `Phone: ${self.phone} - submit()`);
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
      });
    });
  }
}
