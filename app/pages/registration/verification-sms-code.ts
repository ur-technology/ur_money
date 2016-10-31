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

  constructor(public nav: NavController, public navParams: NavParams,
    public auth: AuthService,
    private loadingController: LoadingController,
    private translate: TranslateService,
    private toastService: ToastService
  ) {
    this.nav = nav;
    this.phone = this.navParams.get('phone');
    this.countryCode = this.navParams.get('countryCode');
    this.verificationCode = '';
  }

  submit() {
    let self = this;
    let loadingModal = this.loadingController.create({content: this.translate.instant('pleaseWait'), dismissOnPageChange: true });
    loadingModal.present();

    self.auth.checkFirebaseConnection().then((connected: boolean) => {
      if (!connected) {
        loadingModal.dismiss().then(() => {
          self.toastService.showMessage({messageKey: 'noInternetConnection'});
        });
        return;
      }

      this.auth.checkVerificationCode(this.verificationCode).then((result: any) => {
        loadingModal.dismiss().then(() => {
          this.verificationCode = '';
          if (result.error) {
            log.debug(result.error);
            self.toastService.showMessage({messageKey: 'verification-sms-code.errorVerificationSms'});
          } else if (result.codeMatch) {
            // do nothing
          } else {
            self.toastService.showMessage({messageKey: 'verification-sms-code.errorCode'});
          }
        });
      });
    });
  }

  smsAgain() {
    let self = this;
    this.verificationCode = '';
    let loadingModal = this.loadingController.create({content: this.translate.instant('pleaseWait'), dismissOnPageChange: true });
    loadingModal.present();

    self.auth.checkFirebaseConnection().then((connected: boolean) => {
      if (!connected) {
        loadingModal.dismiss().then(() => {
          self.toastService.showMessage({messageKey: 'noInternetConnection'});
        });
        return;
      }

      this.auth.requestPhoneVerification(this.phone, this.countryCode).then((state: string) => {
        loadingModal.dismiss().then(() => {
          if (state !== 'code_generation_completed_and_sms_sent') {
            self.toastService.showMessage({messageKey: 'verification-sms-code.errorSendingSmsAgain'});
          }
        });
      });
    });
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
