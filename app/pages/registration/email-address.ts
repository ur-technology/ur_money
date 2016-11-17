import {Page, NavController, LoadingController} from 'ionic-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import {CustomValidator} from '../../validators/custom';
import {AuthService} from '../../services/auth';
import {ToastService} from '../../services/toast';
import {AuthenticationCodePage} from './authentication-code';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';

@Page({
  templateUrl: 'build/pages/registration/email-address.html',
  pipes: [TranslatePipe]
})
export class EmailAddressPage {
  mainForm: FormGroup;
  selected: any;

  constructor(
    public nav: NavController,
    public auth: AuthService,
    private loadingController: LoadingController,
    private translate: TranslateService,
    private toastService: ToastService
  ) {
    this.mainForm = new FormGroup({
      email: new FormControl('', [CustomValidator.emailValidator, Validators.required])
    });
  }

  submit() {
    let self = this;
    let email = _.trim(self.mainForm.value.email || '');

    let loadingModal = self.loadingController.create({
      content: self.translate.instant('pleaseWait'),
      dismissOnPageChange: true
    });

    let taskState: string;
    loadingModal.present().then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      return self.auth.requestEmailAuthenticationCode(email);
    }).then((newTaskState: string) => {
      taskState = newTaskState;
      return loadingModal.dismiss();
    }).then(() => {
      switch (taskState) {
        case 'email_code_generation_completed_and_code_sent':
          self.nav.setRoot(AuthenticationCodePage, { authenticationType: 'email' });
          break;

        case 'email_code_generation_canceled_because_user_not_invited':
          self.toastService.showMessage({messageKey: 'email-address.errorUserNotInBetaProgram'});
          break;

        case 'email_code_generation_canceled_because_user_disabled':
          self.toastService.showMessage({messageKey: 'email-address.errorUserDisabled'});
          break;

        default:
          self.toastService.showMessage({messageKey: 'email-address.errorSms'});
      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({messageKey: error.messageKey === 'noInternetConnection' ? 'noInternetConnection' : 'unexpectedErrorMessage' });
      });
    });
  }
}
