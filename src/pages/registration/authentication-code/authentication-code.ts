import { NavController, NavParams, LoadingController} from 'ionic-angular';
import {AuthService} from '../../../services/auth';
import {ToastService} from '../../../services/toast';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {PhoneNumberPage} from '../phone-number/phone-number'
import {EmailAddressPage} from '../email-address';
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
    this.authenticationType = this.navParams.get('authenticationType');
  }

  checkCode() {
    let self = this;
    let loadingModal = self.loadingController.create({content: self.translate.instant('pleaseWait') });

    let authenticationCodeMatch;

    loadingModal.present().then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      if (self.authenticationType === 'email') {
        return self.auth.checkEmailAuthenticationCode(self.authenticationCode);
      } else {
        return self.auth.checkSmsAuthenticationCode(self.authenticationCode);
      }
    }).then((codeMatch: boolean) => {
      authenticationCodeMatch = codeMatch;
      return loadingModal.dismiss();
    }).then(() => {
      this.authenticationCode = '';
      if (authenticationCodeMatch) {
        if (this.authenticationType === 'email') {
          // email is now authenticated, but we still need to authenticate phone number
          this.nav.setRoot(PhoneNumberPage);

        } else {
          // do nothing AuthService will handle a redirect
        }
      } else {
        self.toastService.showMessage({messageKey: 'authentication-code.invalidCode'});
      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({messageKey: error.messageKey === 'noInternetConnection' ? 'noInternetConnection' : 'unexpectedErrorMessage' });
      });
    });
  }

  resendCode() {
    this.nav.setRoot(this.authenticationType === 'email' ? EmailAddressPage : PhoneNumberPage );
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
