import { NavController, LoadingController } from 'ionic-angular';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

@Component({
  selector: 'authentication-code-page',
  templateUrl: 'authentication-code.html',
})
export class AuthenticationCodePage {
  authenticationCode: string = '';
  mainForm: FormGroup;
  pageName = 'AuthenticationCodePage';

  constructor(public nav: NavController,
    public auth: AuthService,
    public loadingController: LoadingController,
    public toastService: ToastService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {

    this.mainForm = new FormGroup({
      code: new FormControl('',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
        ]
      ),
    });
  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
  }

  checkCode() {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Click on check code', 'checkCode()');
    let loadingModal = self.loadingController.create({ content: "Please wait..." });

    let authenticationCodeMatch;

    loadingModal.present().then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      return self.auth.checkSignUpCodeMatching(self.mainForm.value.code);
    }).then((codeMatch: boolean) => {
      authenticationCodeMatch = codeMatch;
      return loadingModal.dismiss();
    }).then(() => {
      if (authenticationCodeMatch) {
        self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Code match succeeded', 'checkCode()');
        // do nothing AuthService will handle a redirect
      } else {
        self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Code was invalid', 'checkCode()');
        self.toastService.showMessage({ message: "The verification code you entered is incorrect or expired. Please try again." });
      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({ message: error.messageKey === 'noInternetConnection' ? 'noInternetConnection' : 'unexpectedErrorMessage' });
      });
    });
  }

  resendCode() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Click on resend code', 'resendCode()');
    this.nav.pop();
  }

}
