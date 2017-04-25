import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { CustomValidator} from '../../../validators/custom';
import { HomePage} from '../../home/home';
import { ToastService} from '../../../services/toast';
import { AuthService } from '../../../services/auth';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html'
})
export class ChangePasswordPage {
  mainForm: FormGroup;
  pageName = 'ChangePasswordPage';

  constructor(public navCtrl: NavController, public navParams: NavParams, private toastService: ToastService, private loadingController: LoadingController, private auth: AuthService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    this.mainForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)]),
      passwordConfirmation: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)])
    }, CustomValidator.isMatchingPassword);
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  submit() {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Clicked on submit button', 'submit()');
    let resultTask: string;
    let loading = this.loadingController.create({ content: "Please wait..." });
    loading.present().then(() => {
      return self.auth.generateHashedPassword(self.mainForm.value.currentPassword);
    }).then((hashedPassword) => {
      return self.auth.currentUser.checkIfPasswordCorrect(hashedPassword);
    }).then((newTaskResult) => {
      resultTask = newTaskResult;
    }).then(() => {
      switch (resultTask) {
        case 'user_check_password_canceled_because_wrong_password':
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'user_check_password_canceled_because_wrong_password', 'submit()');
          throw { errorMessage: 'The current password that you entered does not match our records.' };
        case 'user_check_password_succeded':
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'user_check_password_succeded', 'submit()');
          return Promise.resolve();
        default:
          throw { errorMessage: 'There has been a problem while changing the password' };
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
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Change password succeeded', 'submit()');
          self.toastService.showMessage({ message: 'Password changed' });
          this.navCtrl.setRoot(HomePage);
          break;
        default:
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'unexpected Problem Changing Password', 'submit()');
          self.toastService.showMessage({ message: 'There has been a problem while changing the password' });
      }
    }).catch(error => {
      self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Catch. Unexpected Problem Changing Password', 'submit()');
      loading.dismiss().then(() => {
        self.toastService.showMessage({ message: error.errorMessage });
      });
    });
  }


}
