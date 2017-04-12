import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom';
import { TranslateService } from 'ng2-translate/ng2-translate';
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
    private translate: TranslateService,
    private toastService: ToastService,
    private auth: AuthService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    this.mainForm = new FormGroup({ email: new FormControl('', [Validators.required, CustomValidator.emailValidator]) });
    this.phone = this.navParams.get('phone');
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  submit() {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Click on submit', 'submit()');
    let loadingModal = self.loadingController.create({ content: self.translate.instant('pleaseWait') });

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
                self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Go to ResetPasswordWithCodePage', 'submit()');
                self.toastService.showMessage({ messageKey: 'sign-in.sentRecoveryEmail' });
                break;

              case 'send_recovery_email_canceled_because_user_not_found':
                self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Error. Email not found', 'submit()');
                self.toastService.showMessage({ messageKey: 'errors.emailNotFound'});
                break;

              case 'send_recovery_email_canceled_because_user_disabled':
                self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Error. User disabled', 'submit()');
                self.toastService.showMessage({ messageKey: 'errors.userDisabled'});
                break;

              case 'send_recovery_email_canceled_because_email_not_verified':
                self.toastService.showMessage({ messageKey: 'errors.emailNotVerified'});
                break;

              default:
                self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Error. unexpected Problem', 'submit()');
                self.toastService.showMessage({ messageKey: 'errors.unexpectedProblem' });
            }
          });
      }, (error) => {
        self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Error catch. unexpected Problem', 'submit()');
        loadingModal
          .dismiss()
          .then(() => {
            self.toastService.showMessage({ messageKey: 'errors.unexpectedProblem' });
          });
      });
  }


}
