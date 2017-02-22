import { NavController, LoadingController } from 'ionic-angular';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Component } from '@angular/core';

@Component({
  selector: 'authentication-code-page',
  templateUrl: 'authentication-code.html',
})
export class AuthenticationCodePage {
  authenticationCode: string = '';

  constructor(public nav: NavController,
    public auth: AuthService,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public toastService: ToastService
  ) {
  }

  checkCode() {
    let self = this;
    let loadingModal = self.loadingController.create({ content: self.translate.instant('pleaseWait') });

    let authenticationCodeMatch;

    loadingModal.present().then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      return self.auth.checkSignUpCodeMatching(self.authenticationCode);
    }).then((codeMatch: boolean) => {
      authenticationCodeMatch = codeMatch;
      return loadingModal.dismiss();
    }).then(() => {
      this.authenticationCode = '';
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

  add(numberVar) {
    if (this.authenticationCode.length < 6)
      this.authenticationCode = `${this.authenticationCode}${numberVar}`;
  }

  delete() {
    if (this.authenticationCode.length > 0) {
      this.authenticationCode = this.authenticationCode.substring(0, this.authenticationCode.length - 1);
    }
  }

}
