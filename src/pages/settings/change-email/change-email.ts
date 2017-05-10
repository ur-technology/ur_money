import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, NavParams, LoadingController } from 'ionic-angular';

import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { UserService } from '../../../services/user.service';

import { CustomValidator } from '../../../validators/custom';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

@Component({
  selector: 'page-change-email',
  templateUrl: 'change-email.html'
})
export class ChangeEmailPage {
  pageName = 'ChangeEmailPage';
  mainForm: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private auth: AuthService,
    private toastService: ToastService,
    private userService: UserService,
    private loadingController: LoadingController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    this.mainForm = new FormGroup({
      email: new FormControl('', [Validators.required, CustomValidator.emailValidator])
    });
  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
  }

  submit() {
    if (this.mainForm.value.email === this.auth.currentUser.email) {
      return;
    }

    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on submit button', 'submit change email info');

    let loading = this.loadingController.create({content: "Please wait..."});

    loading
      .present()
      .then(() => {
        // Check email uniqueness
        return this.userService.checkEmailUniqueness(this.mainForm.value.email);
      })
      .then((isUnique: boolean) => {
        if (!isUnique) {
          throw 'email_exists';
        }

        return this.auth.currentUser
          .update({
            email: this.mainForm.value.email,
            isEmailVerified: false,
          });
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
          this.toastService.showMessage({ message: 'Email updated. Please validate your email' });
          this.navCtrl.pop();
        } else {
          this.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
        }
      }, error => {
        loading
          .dismiss()
          .then(() => {
            if (error === 'email_exists') {
              this.toastService.showMessage({ message: 'That email is already registered to another account.' });
            } else {
              this.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
            }
          });
      });
  }
}
