import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LostPasswordPage } from '../lost-password/lost-password';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { TranslateService } from 'ng2-translate/ng2-translate';

declare var trackJs: any;

@Component({
  selector: 'page-sign-in-password',
  templateUrl: 'sign-in-password.html'
})
export class SignInPasswordPage {
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
          self.toastService.showMessage({ messageKey: 'sign-in.credentialsIncorrect' });
          break;
        case 'request_sign_in_canceled_because_user_disabled':
          trackJs.track('Login failed (password page): user disabled');
          self.toastService.showMessage({ messageKey: 'errors.userDisabled' });
          break;
        default:
          trackJs.track('Login failed (password page): unexpected problem');
          self.toastService.showMessage({ messageKey: 'errors.unexpectedProblem' });
      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        trackJs.track('Login failed (password page): unexpected problem');
        self.toastService.showMessage({ messageKey: 'errors.unexpectedProblem' });
      });
    });
  }

  lostPassword() {
    this.navCtrl.push(LostPasswordPage, { phone: this.phone });
  }
}
