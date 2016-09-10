import {Page, NavController, NavParams, AlertController, LoadingController, ToastController} from 'ionic-angular';
import {AuthService} from '../../services/auth';
import {LoadingModalComponent} from '../../components/loading-modal/loading-modal';
import * as log from 'loglevel';

@Page({
  templateUrl: 'build/pages/registration/registration3.html'
})
export class Registration3Page {
  verificationCode: string;
  errorMessage: string;
  phone: string;
  countryCode: string;

  constructor(public nav: NavController, public navParams: NavParams,
    public auth: AuthService,
    private alertCtrl: AlertController, private loadingController: LoadingController, private toastCtrl: ToastController) {
    this.nav = nav;
    this.phone = this.navParams.get('phone');
    this.countryCode = this.navParams.get('countryCode');
    this.verificationCode = '';
  }

  submit() {
    let loading = this.loadingController.create({content: "Please wait...", dismissOnPageChange: true });
    loading.present();
    this.auth.checkVerificationCode(this.verificationCode).then((result: any) => {
      loading.dismiss();
      this.verificationCode = '';
      if (result.error) {
        log.debug(result.error);
        this.showErrorAlert("We were unable to process your verification code. Please try again later");
      } else if (result.codeMatch) {
        // NOTE: nothing to do; navigation will be handled by respondToAuth in auth.ts
      } else {
        this.showErrorAlert("The verification code you entered is incorrect or expired. Please try again.");
      }
    });
  }

  smsAgain() {
    this.verificationCode = '';
    let loading = this.loadingController.create({content: "Please wait...", dismissOnPageChange: true });
    loading.present();
    this.auth.requestPhoneVerification(this.phone, this.countryCode).then((state: string) => {
      loading.dismiss();
      if (state != "code_generation_completed_and_sms_sent") {
        this.showErrorAlert("There was an unexpected problem sending the SMS. Please try again later");
      }
    });
  }

  showErrorAlert(message) {
    let toast = this.toastCtrl.create({
      message: message, duration: 5000, position: 'bottom'
    });
    toast.present();
  }

  add(number) {
    if (this.verificationCode.length < 6)
      this.verificationCode = `${this.verificationCode}${number}`;
  }

  delete() {
    if (this.verificationCode.length > 0) {
      this.verificationCode = this.verificationCode.substring(0, this.verificationCode.length - 1);
    }
  }

}
