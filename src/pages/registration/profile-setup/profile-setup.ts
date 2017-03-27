import * as _ from 'lodash';
import * as log from 'loglevel';
import * as firebase from 'firebase';

import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Component } from '@angular/core';

import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { CustomValidator } from '../../../validators/custom';
import { WalletSetupPage } from '../../../pages/registration/wallet-setup/wallet-setup';

@Component({
  selector: 'profile-setup-page',
  templateUrl: 'profile-setup.html',
})
export class ProfileSetupPage {
  mainForm: FormGroup;
  errorMessage: string;
  constructor(
    public nav: NavController,
    public auth: AuthService,
    public toast: ToastService,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private loadingController: LoadingController
  ) {
    let formElements: any = {
      name: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      email: new FormControl(this.auth.currentUser.email, [Validators.required, CustomValidator.emailValidator])
    };
    this.mainForm = new FormGroup(formElements);

  }

  ionViewDidLoad() {
    let self = this;
    self.auth.reloadCurrentUser().then(() => {
      let name = _.isEmpty(_.trim(self.auth.currentUser.name || '')) ? `${self.auth.currentUser.firstName || ''} ${self.auth.currentUser.lastName || ''}` : self.auth.currentUser.name;
      (<FormControl>self.mainForm.controls['name']).setValue(name);
    });
  }

  showRealNameExplanation() {
    let alert = this.alertCtrl.create({
      message: this.translate.instant('profile-setup.realNameExplanation'),
      buttons: [{
        text: this.translate.instant('ok'),
        handler: () => {
          alert.dismiss();
        }
      }
      ]
    });
    alert.present();
  }

  submit() {
    let loadingModal = this.loadingController.create({ content: this.translate.instant('pleaseWait') });

    loadingModal
      .present()
      .then(() => {
        return this.auth.currentUser.update(this.mainForm.value);
      })
      .then(() => {
        return firebase
          .database()
          .ref('/manualIDVerification/tasks')
          .push({
            id: this.auth.currentUserId
          });
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
                this.toast.showMessage({ messageKey: 'verify-email.verifyEmailSent' });
                break;

              case 'send_verification_email_canceled_because_user_not_found':
                this.toast.showMessage({ messageKey: 'errors.emailNotFound'});
                break;

              case 'send_verification_email_canceled_because_user_disabled':
                this.toast.showMessage({ messageKey: 'errors.userDisabled'});
                break;

              default:
                this.toast.showMessage({ messageKey: 'errors.unexpectedProblem' });
            }
          });

        this.nav.push(WalletSetupPage);
      }, (error) => {
        loadingModal
          .dismiss()
          .then(() => {
            this.toast.showMessage({ messageKey: 'errors.unexpectedProblem' });
            log.warn('unable to save profile info');
          });
      });
    };
}
