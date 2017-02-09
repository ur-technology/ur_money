import { Component } from '@angular/core';
import { Platform, NavController, NavParams, ModalController, LoadingController, AlertController } from 'ionic-angular';
// import {Deeplinks} from 'ionic-native';
import { CountryListService } from '../../../services/country-list';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { TermsAndConditionsPage } from '../../terms-and-conditions/terms-and-conditions';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { AuthenticationCodePage } from '../authentication-code/authentication-code';
import { SignInPage } from '../sign-in/sign-in';
// import * as log from 'loglevel';

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html'
})
export class SignUpPage {
  countries: any[];
  mainForm: FormGroup;
  signUpType: string;
  subheadingTitle = '';
  subheadingButton = '';
  sponsorReferralCode: string;
  email: string;
  password: string;

  constructor(
    public nav: NavController,
    private navParams: NavParams,
    private countryListService: CountryListService,
    private translate: TranslateService,
    public modalCtrl: ModalController,
    public loadingController: LoadingController,
    public auth: AuthService,
    public toastService: ToastService,
    public alertCtrl: AlertController,
    public platform: Platform
  ) {
    this.countries = this.countryListService.getCountryData();
    this.signUpType = this.navParams.get('signUpType') || 'sponsorReferralCode';
    this.extractSponsorReferralCodeFromUrl();
    this.mainForm = new FormGroup({
      country: new FormControl(this.countryListService.getDefaultContry(), Validators.required),
      phone: new FormControl('', (control) => {
        let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
        let phoneNumberObject;
        try {
          phoneNumberObject = phoneNumberUtil.parse(control.value, this.mainForm.value.country.countryCode);
        } catch (e) { }
        if (!phoneNumberObject || !phoneNumberUtil.isValidNumber(phoneNumberObject)) {
          return { 'invalidPhone': true };
        }
      }),
      sponsorReferralCode: new FormControl(this.sponsorReferralCode || '', (control) => {
        if (this.signUpType === 'sponsorReferralCode') {
          if (!/^[a-z0-9]{6,}$/.test(control.value || '')) {
            return { 'invalidSponsorReferralCode': true };
          }
        }
      }),
      email: new FormControl(this.email, (control) => {
        if (this.signUpType === 'email') {
          return Validators.required(control) || CustomValidator.emailValidator(control);
        }
      }),
      password: new FormControl('', [Validators.required]),
      passwordConfirmation: new FormControl('', (control) => {
        let error = Validators.required(control);
        if (!error && control.value !== this.mainForm.value.password) {
          error = { 'mismatchedPassword': true };
        }
        return error;
      })
    });

  }

  private extractSponsorReferralCodeFromUrl() {
    let pathname: string = window.location.pathname || '';
    let matches: string[] = pathname.match(/\/r\/([a-zA-Z0-9]+)/);
    if (!matches || !matches[1]) {
      let params: string = window.location.search || '';
      matches = params.match(/[\?\&]r\=([a-zA-Z0-9]+)/);
    }
    this.sponsorReferralCode = matches && matches[1];
  }

  ionViewDidLoad() {
    this.changeTitlesBySignUpType();
  }

  changeSignUpType() {
    this.signUpType = this.signUpType === 'sponsorReferralCode' ? 'email' : 'sponsorReferralCode';
    this.changeTitlesBySignUpType();
  }

  private changeTitlesBySignUpType() {
    this.subheadingButton = this.translate.instant(
      this.signUpType === 'sponsorReferralCode' ?
        'sign-up.signUpWithEmailCodeInstead' :
        'sign-up.signUpWithSponsorReferralCodeInstead'
    );
  }

  private normalizedPhone(): string {
    let strippedPhone: string = (this.mainForm.value.phone || '').replace(/\D/g, '');
    let extraPrefix: string = this.mainForm.value.country.mobileAreaCodePrefix || '';
    if (extraPrefix && strippedPhone.startsWith(extraPrefix)) {
      extraPrefix = '';
    }
    return this.mainForm.value.country.telephoneCountryCode + extraPrefix + strippedPhone;
  }

  submit() {
    let self = this;
    let loadingModal = self.loadingController.create({
      content: self.translate.instant('pleaseWait'),
    });
    let taskState: string;
    loadingModal.present().then(() => {
      return self.auth.requestSignUpCodeGeneration(
        self.normalizedPhone(),
        self.mainForm.value.password,
        self.signUpType === 'sponsorReferralCode' ? self.sponsorReferralCode : null,
        self.signUpType === 'email' ? self.email : null
      );
    }).then((newTaskState: string) => {
      taskState = newTaskState;
      return loadingModal.dismiss();
    }).then(() => {
      switch (taskState) {
        case 'code_generation_finished':
          self.nav.setRoot(AuthenticationCodePage);
          break;

        case 'code_generation_canceled_because_user_already_signed_up':
          let alert = this.alertCtrl.create({
            message: this.translate.instant('sign-up.userAlreadyExists'),
            buttons: [
              { text: this.translate.instant('cancel'), handler: () => { alert.dismiss(); } },
              {
                text: this.translate.instant('sign-up.gotoSignIn'), handler: () => {
                  alert.dismiss().then(() => {
                    self.nav.pop({ animate: false, duration: 0, progressAnimation: false }).then(data => {
                      self.nav.push(SignInPage);
                    });
                  });
                }
              }
            ]
          });
          alert.present();
          break;

        case 'code_generation_canceled_because_voip_phone_not_allowed':
          self.toastService.showMessage({ messageKey: 'phone-number.unexpectedProblem' });
          break;

        case 'code_generation_canceled_because_sponsor_not_found':
        case 'code_generation_canceled_because_sponsor_disabled':
          self.toastService.showMessage({ messageKey: 'phone-number.sponsorNotFoundMessage' });
          break;

        default:
          self.toastService.showMessage({ messageKey: 'phone-number.unexpectedProblem' });

      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({ messageKey: 'phone-number.unexpectedProblem' });
      });
    });
  }

  openTermsAndConditions() {
    let modal = this.modalCtrl.create(TermsAndConditionsPage);
    modal.present();
  }

  showSponsorReferralCodeExplanation() {
    let alert = this.alertCtrl.create({
      message: this.translate.instant('sign-up.sponsorReferralCodeExplanation'),
      buttons: [{
        text: this.translate.instant('ok'),
        handler: () => {
          alert.dismiss();
        }
      }
      ]
    });
    alert.present();
  }

  showEmailExplanation() {
    let alert = this.alertCtrl.create({
      message: this.translate.instant('sign-up.emailExplanation'),
      buttons: [{
        text: this.translate.instant('ok'),
        handler: () => {
          alert.dismiss();
        }
      }
      ]
    });
    alert.present();
  }
}
