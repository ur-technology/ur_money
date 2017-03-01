import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LostPasswordPage } from '../lost-password/lost-password';
import { AuthService } from '../../../services/auth';
import { ToastService} from '../../../services/toast';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { HomePage } from '../../home/home';

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
      return self.auth.signIn(self.phone, self.mainForm.value.password)
    }).then((newTask: string) => {
      task = newTask;
      return loadingModal.dismiss();
    }).then(() => {
      switch (task) {
        case 'sign_in_finished':
          // Auth service will redirect to the right page after login
          break;
        case 'sign_in_canceled_because_password_incorrect':
          self.toastService.showMessage({ messageKey: 'sign-in.credentialsIncorrect' });
          break;
        case 'request_sign_in_canceled_because_user_disabled':
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
