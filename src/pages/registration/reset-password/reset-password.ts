import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController} from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator} from '../../../validators/custom';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { ToastService} from '../../../services/toast';
import { HomePage } from '../../home/home';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html'
})
export class ResetPasswordPage {
  mainForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthService, private toastService: ToastService, private translate: TranslateService, private loadingController: LoadingController) {
    this.mainForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)]),
      passwordConfirmation: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)])
    }, CustomValidator.isMatchingPassword);
  }

  submit() {
    let self = this;
    let loadingModal = self.loadingController.create({ content: self.translate.instant('pleaseWait') });

    loadingModal.present().then(() => {
      //TODO change password in DB
      return loadingModal.dismiss();

    }).then(() => {
      self.navCtrl.setRoot(HomePage);
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({ messageKey: 'sign-in.unexpectedProblem' });
      });
    });
  }
}
