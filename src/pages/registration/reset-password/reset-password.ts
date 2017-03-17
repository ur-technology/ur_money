import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { ToastService } from '../../../services/toast';
import { AuthService } from '../../../services/auth';
import { SignInPage } from '../sign-in/sign-in';

@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html'
})
export class ResetPasswordPage {
  mainForm: FormGroup;
  phone: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthService, private toastService: ToastService, private translate: TranslateService, private loadingController: LoadingController) {
    this.phone = this.navParams.get('phone');
    this.mainForm = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)]),
      passwordConfirmation: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)])
    }, CustomValidator.isMatchingPassword);
  }


  submit() {
    let self = this;
    let taskResult;
    let loadingModal = self.loadingController.create({ content: self.translate.instant('pleaseWait') });
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
          self.toastService.showMessage({ messageKey: 'sign-in.passwordChanged' });
          self.navCtrl.setRoot(SignInPage);
          break;

        default:
          self.toastService.showMessage({ messageKey: 'errors.unexpectedProblem' });
      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({ messageKey: 'errors.unexpectedProblem' });
      });
    });
  }
}
