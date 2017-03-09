import { NavController, LoadingController } from 'ionic-angular';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'authentication-code-page',
  templateUrl: 'authentication-code.html',
})
export class AuthenticationCodePage {
  authenticationCode: string = '';
  mainForm: FormGroup;

  constructor(public nav: NavController,
    public auth: AuthService,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public toastService: ToastService
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

  checkCode() {
    let self = this;
    let loadingModal = self.loadingController.create({ content: self.translate.instant('pleaseWait') });

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
        // do nothing AuthService will handle a redirect
      } else {
        self.toastService.showMessage({ messageKey: 'authentication-code.invalidCode' });
      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({ messageKey: error.messageKey === 'noInternetConnection' ? 'noInternetConnection' : 'unexpectedErrorMessage' });
      });
    });
  }

  resendCode() {
    this.nav.pop();
  }

}
