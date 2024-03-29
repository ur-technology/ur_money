import * as _ from 'lodash';
import * as log from 'loglevel';

import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component } from '@angular/core';

import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { UserService } from '../../../services/user.service';

import { CustomValidator } from '../../../validators/custom';
import { WalletSetupPage } from '../../../pages/registration/wallet-setup/wallet-setup';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

@Component({
  selector: 'profile-setup-page',
  templateUrl: 'profile-setup.html',
})
export class ProfileSetupPage {
  mainForm: FormGroup;
  errorMessage: string;
  pageName = 'ProfileSetupPage';

  constructor(
    public nav: NavController,
    public auth: AuthService,
    public toast: ToastService,
    public userService: UserService,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    let formElements: any = {
      name: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      email: new FormControl(this.auth.currentUser.email, [Validators.required, CustomValidator.emailValidator])
    };
    this.mainForm = new FormGroup(formElements);

  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
  }

  ionViewDidLoad() {
    let self = this;
    self.auth.reloadCurrentUser().then(() => {
      let name = _.isEmpty(_.trim(self.auth.currentUser.name || '')) ?
        `${self.auth.currentUser.firstName || ''} ${self.auth.currentUser.lastName || ''}` :
        self.auth.currentUser.name;
      (<FormControl>self.mainForm.controls['name']).setValue(name);
    });
  }

  showRealNameExplanation(event) {
    event.preventDefault();
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Click on Real Name Explanation', 'showRealNameExplanation()');
    let alert = this.alertCtrl.create({
      message: "This should be your real name, as in the name that's listed on your credit card, driver's license or student ID. It will only be used within the UR application so that other people know who they're transacting with.",
      buttons: [{
        text: "Ok",
        handler: () => {
          alert.dismiss();
          return false;
        }
      }]
    });
    alert.present();
  }

  submit() {
    let loadingModal = this.loadingController.create({ content: "Please wait..." });
    let email = this.mainForm.value.email.toLowerCase();

    loadingModal
      .present()
      .then(() => {
        // Check email uniqueness
        if (this.auth.currentUser.email === email) {
          return true;
        } else {
          return this.userService.checkEmailUniqueness(email);
        }
      })
      .then((isUnique: boolean) => {
        if (!isUnique) {
          throw 'email_exists';
        }

        return this.auth.currentUser.update({ name: this.mainForm.value.name, email: email });
      })
      .then(() => {
        return this.auth.sendVerificationEmail(
          this.auth.currentUser.phone,
          this.auth.currentUser.email
        );
      })
      .then((taskState: string) => {
        loadingModal
          .dismiss()
          .then(() => {
            switch (taskState) {
              case 'send_verification_email_finished':
                this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Profile setup completed', 'submit profile setup info');
                this.toast.showMessage({ message: "A verification email has been sent to your email address. Please read it and follow the instructions. If you don't see the message, please check your spam folder." });
                this.nav.push(WalletSetupPage);
                break;

              case 'send_verification_email_canceled_because_user_not_found':
                this.toast.showMessage({ message: 'The email that you entered did not match our records. Please double-check and try again.' });
                break;

              case 'send_verification_email_canceled_because_user_disabled':
                this.toast.showMessage({ message: 'Your user account has been disabled.' });
                break;

              default:
                this.toast.showMessage({ message: 'There was an unexpected problem. Please try again later' });
            }
          });
      }, (error) => {
        loadingModal
          .dismiss()
          .then(() => {
            if (error === 'email_exists') {
              this.toast.showMessage({ message: 'That email is already registered to another account.' });
            } else {
              this.toast.showMessage({ message: 'There was an unexpected problem. Please try again later' });
            }
            log.warn('unable to save profile info');
          });
      });
  }
}
