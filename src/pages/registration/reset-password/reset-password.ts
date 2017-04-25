import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom';
import { ToastService } from '../../../services/toast';
import { AuthService } from '../../../services/auth';
import { SignInPage } from '../sign-in/sign-in';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html'
})
export class ResetPasswordPage {
  mainForm: FormGroup;
  phone: string;
  pageName = 'ResetPasswordPage';

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthService, private toastService: ToastService, private loadingController: LoadingController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    this.phone = this.navParams.get('phone');
    this.mainForm = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)]),
      passwordConfirmation: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)])
    }, CustomValidator.isMatchingPassword);
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  submit() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Click on submit button', 'submit()');
    let self = this;
    let taskResult;
    let loadingModal = self.loadingController.create({ content: "Please wait..." });
    loadingModal.present().then(() => {
      return this.auth.generateHashedPassword(self.mainForm.value.password);
    }).then((password) => {
      return self.auth.requestChangeTempPassword(self.phone, password);
    }).then((newTaskState) => {
      taskResult = newTaskState;
      return loadingModal.dismiss();
    }).then(() => {

      switch (taskResult) {
        case 'request_change_temp_password_succeeded':
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Change password succeeded', 'submit()');
          self.toastService.showMessage({ message: "Your password has been changed. For your security, please sign in with your new password." });
          self.navCtrl.setRoot(SignInPage);
          break;

        default:
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'unexpected Problem', 'submit()');
          self.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
      }
    }, (error) => {
      self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Catch. unexpected Problem', 'submit()');
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
      });
    });
  }
}
