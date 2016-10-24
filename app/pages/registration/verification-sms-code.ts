import {Page, NavController, NavParams, AlertController, LoadingController, ToastController} from 'ionic-angular';
import {AuthService} from '../../services/auth';
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
    private alertCtrl: AlertController, private loadingController: LoadingController, private toastCtrl: ToastController, private translate: TranslateService) {
    this.nav = nav;
    this.phone = this.navParams.get('phone');
    this.countryCode = this.navParams.get('countryCode');
    this.verificationCode = '';
  }

  submit() {
    let loading = this.loadingController.create({content: this.translate.instant('pleaseWait'), dismissOnPageChange: true });
    loading.present();
    this.auth.checkVerificationCode(this.verificationCode).then((result: any) => {
      loading.dismiss().then(() => {
        this.verificationCode = '';
        if (result.error) {
          log.debug(result.error);
          this.showErrorAlert(this.translate.instant('verification-sms-code.errorVerificationSms'));
        } else if (result.codeMatch) {
          loading.dismiss();
        } else {
          this.showErrorAlert(this.translate.instant('verification-sms-code.errorCode'));
        }
      });
    });
  }

  smsAgain() {
    this.verificationCode = '';
    let loading = this.loadingController.create({content: this.translate.instant('pleaseWait'), dismissOnPageChange: true });
    loading.present();
    this.auth.requestPhoneVerification(this.phone, this.countryCode).then((state: string) => {
      loading.dismiss();
      if (state !== 'code_generation_completed_and_sms_sent') {
        this.showErrorAlert(this.translate.instant('verification-sms-code.errorSendingSmsAgain'));
      }
    });
  }

  showErrorAlert(message) {
    let toast = this.toastCtrl.create({
      message: message, duration: 3500, position: 'bottom'
    });
    toast.present();
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
