import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LostPasswordPage } from '../lost-password/lost-password';
import { AuthService } from '../../../services/auth';
import { ToastService} from '../../../services/toast';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { ResetPasswordPage } from '../reset-password/reset-password';

@Component({
  selector: 'page-sign-in-temporary-password',
  templateUrl: 'sign-in-temporary-password.html'
})
export class SignInTemporaryPasswordPage {
  mainForm: FormGroup;
  phone: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthService, private toastService: ToastService, private loadingController: LoadingController, private translate: TranslateService) {
    this.mainForm = new FormGroup({ password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)]) });
    this.phone = this.navParams.get('phone');
  }

  submit() {
    let self = this;
    let task: string;
    let loadingModal = self.loadingController.create({ content: self.translate.instant('pleaseWait') });

    loadingModal.present().then(() => {
      return self.auth.requestCheckTempPassword(self.phone, self.mainForm.value.password)
    }).then((newTask: string) => {
      task = newTask;
      return loadingModal.dismiss();
    }).then(() => {
      switch (task) {
        case 'request_check_temp_password_succeded':
          self.navCtrl.setRoot(ResetPasswordPage, {phone: self.phone});
          break;
        case 'request_check_temp_password_canceled_because_wrong_password':
          self.toastService.showMessage({ messageKey: 'sign-in.credentialsIncorrect' });
          break;
        case 'request_check_temp_password_canceled_because_user_not_found':
          self.toastService.showMessage({ messageKey: 'sign-in.userDisabled' });
          break;
        default:
          self.toastService.showMessage({ messageKey: 'sign-in.unexpectedProblem' });
      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({ messageKey: 'sign-in.unexpectedProblem' });
      });
    });
  }

  lostPassword() {
    this.navCtrl.push(LostPasswordPage);
  }
}
