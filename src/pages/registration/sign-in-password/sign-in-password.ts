import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LostPasswordPage } from '../lost-password/lost-password';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

declare var trackJs: any;

@Component({
  selector: 'page-sign-in-password',
  templateUrl: 'sign-in-password.html'
})
export class SignInPasswordPage {
  pageName = 'SignInPasswordPage';
  mainForm: FormGroup;
  phone: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthService, private toastService: ToastService, private loadingController: LoadingController,
  private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    this.mainForm = new FormGroup({ password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)]) });
    this.phone = this.navParams.get('phone');
  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
  }

  submit() {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Clicked on submit password button', 'submit in password info');
    let task: string;
    let loadingModal = self.loadingController.create({ content: "Please wait..." });

    loadingModal.present().then(() => {
      return this.auth.generateHashedPassword(self.mainForm.value.password);
    }).then((password) => {
      return self.auth.signIn(self.phone, password);
    }).then((newTask: string) => {
      task = newTask;
      return loadingModal.dismiss();
    }).then(() => {
      switch (task) {
        case 'sign_in_finished':
          // Auth service will redirect to the right page after login
          break;
        case 'sign_in_canceled_because_password_incorrect':
          trackJs.track('Login failed (password page): incorrect password');
          self.toastService.showMessage({ message: "The number and password that you entered did not match our records. Please double-check and try again." });
          break;
        case 'request_sign_in_canceled_because_user_disabled':
          trackJs.track('Login failed (password page): user disabled');
          self.toastService.showMessage({ message: 'Your user account has been disabled.' });
          break;
        default:
          trackJs.track('Login failed (password page): unexpected problem');
          self.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        trackJs.track('Login failed (password page): unexpected problem');
        self.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
      });
    });
  }

  lostPassword() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Go to lost password page', 'Clicked lost password button');
    this.navCtrl.push(LostPasswordPage, { phone: this.phone });
  }
}
