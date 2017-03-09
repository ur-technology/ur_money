import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom';
import { WelcomePage } from '../welcome/welcome';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { ToastService } from '../../../services/toast';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'page-lost-password',
  templateUrl: 'lost-password.html'
})
export class LostPasswordPage {
  mainForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, private loadingController: LoadingController, private translate: TranslateService, private toastService: ToastService, private auth: AuthService) {
    this.mainForm = new FormGroup({ email: new FormControl('', [Validators.required, CustomValidator.emailValidator]) });
  }

  submit() {
    let self = this;
    let taskState: string;
    let loadingModal = self.loadingController.create({ content: self.translate.instant('pleaseWait') });

    loadingModal.present().then(() => {
      return self.auth.sendRecoveryEmail(self.mainForm.value.email);
    }).then((newTaskState: string) => {
      taskState = newTaskState;
      return loadingModal.dismiss();
    }).then(() => {
      switch (taskState) {
        case 'email-sent':
        self.toastService.showMessage({messageKey:'sign-in.emailSent'});
        self.navCtrl.setRoot(WelcomePage);
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


}
