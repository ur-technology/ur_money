import * as _ from 'lodash';
import * as log from 'loglevel';

import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from 'ng2-translate/ng2-translate';
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
    private translate: TranslateService,
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

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
    let self = this;
    self.auth.reloadCurrentUser().then(() => {
      let name = _.isEmpty(_.trim(self.auth.currentUser.name || '')) ?
        `${self.auth.currentUser.firstName || ''} ${self.auth.currentUser.lastName || ''}` :
        self.auth.currentUser.name;
      (<FormControl>self.mainForm.controls['name']).setValue(name);
    });
  }

  showRealNameExplanation() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Click on Real Name Explanation', 'showRealNameExplanation()');
    let alert = this.alertCtrl.create({
      message: this.translate.instant('profile-setup.realNameExplanation'),
      buttons: [{
        text: this.translate.instant('ok'),
        handler: () => {
          alert.dismiss();
        }
      }]
    });
    alert.present();
  }

  submit() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Click on Continue button', 'submit()');
    let loadingModal = this.loadingController.create({ content: this.translate.instant('pleaseWait') });

    loadingModal
      .present()
      .then(() => {
        // Check email uniqueness
        if (this.auth.currentUser.email === this.mainForm.value.email) {
          return true;
        } else {
          return this.userService.checkEmailUniqueness(this.mainForm.value.email);
        }
      })
      .then((isUnique: boolean) => {
        if (!isUnique) {
          throw 'email_exists';
        }

        return this.auth.currentUser.update(this.mainForm.value);
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
                this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Verification email sent', 'submit()');
                this.toast.showMessage({ messageKey: 'verify-email.verifyEmailSent' });
                break;

              case 'send_verification_email_canceled_because_user_not_found':
                this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Verification email not sent. User not found', 'submit()');
                this.toast.showMessage({ messageKey: 'errors.emailNotFound' });
                break;

              case 'send_verification_email_canceled_because_user_disabled':
                this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Verification email not sent. User disabled', 'submit()');
                this.toast.showMessage({ messageKey: 'errors.userDisabled' });
                break;

              default:
                this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Verification email not sent. unexpected Problem', 'submit()');
                this.toast.showMessage({ messageKey: 'errors.unexpectedProblem' });
            }
          });

        this.nav.push(WalletSetupPage);
      }, (error) => {
        this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Verification email not sent. unexpected Problem', 'submit()');
        loadingModal
          .dismiss()
          .then(() => {
            if (error === 'email_exists') {
              this.toast.showMessage({ messageKey: 'errors.emailNotUnique' });
            } else {
              this.toast.showMessage({ messageKey: 'errors.unexpectedProblem' });
            }
            log.warn('unable to save profile info');
          });
      });
  }
}
