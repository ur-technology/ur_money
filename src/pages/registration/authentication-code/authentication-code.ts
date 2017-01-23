import { NavController, NavParams, LoadingController} from 'ionic-angular';
import {AuthService} from '../../../services/auth';
import {ToastService} from '../../../services/toast';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {PhoneNumberPage} from '../phone-number/phone-number'
import {SignUpPage} from '../sign-up/sign-up';
import { Component } from '@angular/core';

@Component({
  selector: 'authentication-code-page',
  templateUrl: 'authentication-code.html',
})
export class AuthenticationCodePage {
  authenticationCode: string = '';
  authenticationType: string;

  constructor(public nav: NavController, public navParams: NavParams,
    public auth: AuthService,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public toastService: ToastService
  ) {
    this.nav = nav;
    this.authenticationType = this.navParams.get('authenticationType') || 'signIn';
  }

  checkCode() {
    let self = this;
    let loadingModal = self.loadingController.create({ content: self.translate.instant('pleaseWait') });

    let authenticationCodeMatch;

    loadingModal.present().then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      return self.auth.checkAuthenticationCode(self.authenticationCode);
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
    this.nav.setRoot(this.authenticationType === 'signUp' ? SignUpPage : PhoneNumberPage);
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
