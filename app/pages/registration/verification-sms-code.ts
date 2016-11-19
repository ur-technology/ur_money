import {Page, NavController, NavParams, LoadingController} from 'ionic-angular';
import {AuthService} from '../../services/auth';
import {ToastService} from '../../services/toast';
import * as log from 'loglevel';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';

@Page({
  templateUrl: 'build/pages/registration/verification-sms-code.html',
  pipes: [TranslatePipe]
})
export class VerificationSmsCodePage {
  verificationCode: string;
  errorMessage: string;
  phone: string;
  countryCode: string;
  countryIso: string;

  constructor(public nav: NavController, public navParams: NavParams,
    public auth: AuthService,
    private loadingController: LoadingController,
    private translate: TranslateService,
    private toastService: ToastService
  ) {
    this.nav = nav;
    this.phone = this.navParams.get('phone');
    this.countryCode = this.navParams.get('countryCode');
    this.countryIso = this.navParams.get('countryIso');
    this.verificationCode = '';
  }

  submit() {
    let self = this;
    let loadingModal = self.loadingController.create({content: self.translate.instant('pleaseWait') });

    let verificationResult;

    loadingModal.present().then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      return self.auth.checkVerificationCode(self.verificationCode, this.countryIso);
    }).then((result: any) => {
      verificationResult = result;
      return loadingModal.dismiss();
    }).then(() => {
      this.verificationCode = '';
      if (verificationResult.error) {
        log.debug(verificationResult.error);
        self.toastService.showMessage({messageKey: 'verification-sms-code.errorVerificationSms'});
      } else if (verificationResult.codeMatch) {
        // do nothing AuthService will handle a redirect
      } else {
        self.toastService.showMessage({messageKey: 'verification-sms-code.errorCode'});
      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({messageKey: error.messageKey === 'noInternetConnection' ? 'noInternetConnection' : 'unexpectedErrorMessage' });
      });
    });
  }

  smsAgain() {
    let self = this;
    this.verificationCode = '';
    let loadingModal = this.loadingController.create({content: this.translate.instant('pleaseWait'), dismissOnPageChange: true });

    let taskState: string;

    setTimeout(() => {

      loadingModal.present().then(() => {
        return self.auth.checkFirebaseConnection();
      }).then(() => {
        return self.auth.requestPhoneVerification(self.phone, self.countryCode);
      }).then((newTaskState: string) => {
        taskState = newTaskState;
        return loadingModal.dismiss();
      }).then(() => {
        if (taskState === 'code_generation_completed_and_sms_sent') {
          self.toastService.showMessage({messageKey: 'verification-sms-code.smsResent'});
        } else {
          self.toastService.showMessage({messageKey: 'verification-sms-code.errorSendingSmsAgain'});
        }
      }, (error) => {
        loadingModal.dismiss().then(() => {
          self.toastService.showMessage({messageKey: error.messageKey === 'noInternetConnection' ? 'noInternetConnection' : 'unexpectedErrorMessage' });
        });
      });
    }, 4000);
  }

  add(numberVar) {
    if (this.verificationCode.length < 6)
      this.verificationCode = `${this.verificationCode}${numberVar}`;
  }

  delete() {
    if (this.verificationCode.length > 0) {
      this.verificationCode = this.verificationCode.substring(0, this.verificationCode.length - 1);
    }
  }

}
