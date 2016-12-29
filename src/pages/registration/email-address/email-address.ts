import { NavController, NavParams, LoadingController} from 'ionic-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import {CustomValidator} from '../../../validators/custom';
import {AuthService} from '../../../services/auth';
import {ToastService} from '../../../services/toast';
import {AuthenticationCodePage} from '../authentication-code/authentication-code';
import {TranslateService} from 'ng2-translate/ng2-translate';
import { Component } from '@angular/core';

@Component({
  selector: 'email-address-page',
  templateUrl: 'email-address.html',
})
export class EmailAddressPage {
  mainForm: FormGroup;
  selected: any;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public toastService: ToastService
  ) {
    this.mainForm = new FormGroup({
      email: new FormControl('', [CustomValidator.emailValidator, Validators.required])
    });
  }

  submit() {
    let self = this;

    let loadingModal = self.loadingController.create({
      content: self.translate.instant('pleaseWait'),
      dismissOnPageChange: true
    });

    let taskState: string;
    loadingModal.present().then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      self.auth.email = _.trim(self.mainForm.value.email || '');
      return self.auth.requestAuthenticationCode();
    }).then((newTaskState: string) => {
      taskState = newTaskState;
      return loadingModal.dismiss();
    }).then(() => {
      switch (taskState) {
        case 'code_generation_finished':
          self.nav.setRoot(AuthenticationCodePage, { authenticationType: 'email' });
          break;

        case 'code_generation_canceled_because_user_not_invited':
          self.toastService.showMessage({messageKey: 'email-address.errorUserNotInBetaProgram'});
          break;

        case 'code_generation_canceled_because_user_disabled':
          self.toastService.showMessage({messageKey: 'email-address.errorUserDisabled'});
          break;

        default:
          self.toastService.showMessage({messageKey: 'email-address.unexpectedProblem'});
      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({messageKey: error.messageKey === 'noInternetConnection' ? 'noInternetConnection' : 'unexpectedErrorMessage' });
      });
    });
  }
}
