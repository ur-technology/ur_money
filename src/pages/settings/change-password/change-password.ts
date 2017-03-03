import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { CustomValidator} from '../../../validators/custom';
import { HomePage} from '../../home/home';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { ToastService} from '../../../services/toast';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html'
})
export class ChangePasswordPage {
  mainForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, private toastService: ToastService, private translate: TranslateService, private loadingController: LoadingController, private auth: AuthService) {
    this.mainForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)]),
      passwordConfirmation: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)])
    }, CustomValidator.isMatchingPassword);
  }

  submit() {
    let self = this;
    let resultTask: string;
    let loading = this.loadingController.create({ content: this.translate.instant('pleaseWait') });
    loading.present().then(() => {
      return self.auth.generateHashedPassword(self.mainForm.value.currentPassword);
    }).then((hashedPassword) => {
      return self.auth.currentUser.checkIfPasswordCorrect(hashedPassword);
    }).then((newTaskResult) => {
      resultTask = newTaskResult;
    }).then(() => {
      switch (resultTask) {
        case 'user_check_password_canceled_because_wrong_password':
          throw { errorMessageKey: 'settings.passwordIncorrect' };
        case 'user_check_password_succeded':
          return Promise.resolve();
        default:
          throw { errorMessageKey: 'settings.unexpectedProblemChangingPassword' };
      }
    }).then(() => {
      return self.auth.generateHashedPassword(self.mainForm.value.password);
    }).then((hashedPassword) => {
      return self.auth.currentUser.changeCurrentPassword(hashedPassword);
    }).then((newTaskResult) => {
      resultTask = newTaskResult;
      return loading.dismiss();
    }).then(() => {
      switch (resultTask) {
        case 'user_password_change_succeeded':
          self.toastService.showMessage({ messageKey: 'settings.passwordChanged' });
          this.navCtrl.setRoot(HomePage);
          break;
        default:
          self.toastService.showMessage({ messageKey: 'settings.unexpectedProblemChangingPassword' });
      }
    }).catch(error => {
      loading.dismiss().then(() => {
        self.toastService.showMessage({ messageKey: error.errorMessageKey });
      });
    });
  }


}
