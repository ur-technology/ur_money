import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, AlertController } from 'ionic-angular';
import {CountryListService} from '../../../services/country-list';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {CustomValidator} from '../../../validators/custom';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {TermsAndConditionsPage} from '../../terms-and-conditions/terms-and-conditions';
import {AuthService} from '../../../services/auth';
import {ToastService} from '../../../services/toast';
import {AuthenticationCodePage} from '../authentication-code/authentication-code';
import {PhoneNumberPage} from '../phone-number/phone-number';

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html'
})
export class SignUpPage {
  countries: any[];
  mainForm: FormGroup;
  signUpType;
  subheadingTitle = '';
  subheadingButton = '';


  constructor(public nav: NavController, private navParams: NavParams, private countryListService: CountryListService, private translate: TranslateService, public modalCtrl: ModalController, public loadingController: LoadingController, public auth: AuthService, public toastService: ToastService, public alertCtrl: AlertController) {
    this.countries = this.countryListService.getCountryData();
    this.signUpType = this.navParams.get('signUpType') || 'referralCode';
    this.mainForm = new FormGroup({
      country: new FormControl(this.countryListService.getDefaultContry(), Validators.required),
      phone: new FormControl('', (control) => {
        try {
          let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
          let phoneNumberObject = phoneNumberUtil.parse(control.value, this.mainForm.value.country.countryCode);
          if (!phoneNumberUtil.isValidNumber(phoneNumberObject)) {
            return { 'invalidPhone': true };
          }
        } catch (e) {
          return { 'invalidPhone': true };
        }
      })
    });
    this.changeTitlesBySignUpType();
    this.addControlByType();
  }

  changeSignUpType() {
    this.signUpType = this.signUpType === 'referralCode' ? 'email' : 'referralCode';
    this.changeTitlesBySignUpType();
    this.addControlByType();
  }

  private addControlByType() {
    if (this.signUpType === 'referralCode') {
      this.mainForm.addControl('referralCode', new FormControl(this.auth.sponsorReferralCode || '', Validators.required))
      this.mainForm.removeControl('email');
    } else {
      this.mainForm.addControl('email', new FormControl('', [Validators.required, CustomValidator.emailValidator]))
      this.mainForm.removeControl('referralCode');
    }
  }

  private changeTitlesBySignUpType() {
    if (this.signUpType === 'referralCode') {
      this.subheadingTitle = this.translate.instant('sign-up.headingReferral');
      this.subheadingButton = this.translate.instant('sign-up.subheadingButtonEmail');
    }
    else {
      this.subheadingTitle = this.translate.instant('sign-up.headingEmail');
      this.subheadingButton = this.translate.instant('sign-up.subheadingButtonReferal');
    }
  }

  private normalizedPhone(phone) {
    return (phone || '').replace(/\D/g, '');
  }

  submit() {
    let self = this;
    let corePhone = self.normalizedPhone(self.mainForm.value.phone);
    let mobileAreaCodePrefix = '';
    if (self.mainForm.value.country.mobileAreaCodePrefix && !corePhone.startsWith(self.mainForm.value.country.mobileAreaCodePrefix)) {
      mobileAreaCodePrefix = self.mainForm.value.country.mobileAreaCodePrefix;
    }

    let phone = self.mainForm.value.country.telephoneCountryCode + mobileAreaCodePrefix + corePhone;
    let loadingModal = self.loadingController.create({
      content: self.translate.instant('pleaseWait'),
    });

    let taskState: string;
    loadingModal.present().then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      self.auth.phone = phone;
      self.auth.countryCode = self.mainForm.value.country.countryCode;
      if (self.signUpType === 'referralCode') {
        self.auth.sponsorReferralCode = self.mainForm.value.referralCode;
        self.auth.email = undefined;
      } else {
        self.auth.email = self.mainForm.value.email;
        self.auth.sponsorReferralCode = undefined;
      }
      self.auth.version = 2;
      return self.auth.requestPhoneRegistration();
    }).then((newTaskState: string) => {
      switch (newTaskState) {
        case 'phone_registration_successful’':
          return self.auth.requestAuthenticationCode();
        default:
          return newTaskState;
      }
    }).then((newTaskState: string) => {
      taskState = newTaskState;
      return loadingModal.dismiss();
    }).then(() => {
      switch (taskState) {
        case 'code_generation_finished':
          self.nav.setRoot(AuthenticationCodePage, { authenticationType: 'signUp' });
          break;
        case 'code_generation_canceled_because_user_disabled':
          self.toastService.showMessage({ messageKey: 'phone-number.errorUserDisabled' });
          break;
        case 'code_generation_canceled_because_of_excessive_failed_logins':
          self.toastService.showMessage({ messageKey: 'phone-number.errorExcessiveLogins' });
          break;
        case 'code_generation_canceled_because_user_not_invited':
          self.toastService.showMessage({ messageKey: 'email-address.errorUserNotInBetaProgram' });
          break;
        case 'sign_up_failed_because_sponsor_not_found':
          self.toastService.showMessage({ messageKey: 'sign-up.sponsorNotFoundMessage' });
          break;
        case 'phone_registration_failed_because_user_already_signed_up':
          let alert = this.alertCtrl.create({
            message: this.translate.instant('sign-up.userAlreadyExists'),
            buttons: [
              { text: this.translate.instant('cancel'), handler: () => { alert.dismiss(); } },
              {
                text: this.translate.instant('sign-up.gotoSignIn'), handler: () => {
                  alert.dismiss().then(() => {
                    self.nav.pop({ animate: false, duration: 0, progressAnimation: false }).then(data => {
                      self.nav.push(PhoneNumberPage);
                    });
                  });
                }
              }
            ]
          });
          alert.present();
          break;

        default:
          self.toastService.showMessage({ messageKey: 'phone-number.unexpectedProblem' });
      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({ messageKey: error.messageKey === 'noInternetConnection' ? 'noInternetConnection' : 'unexpectedErrorMessage' });
      });
    });
  }

  openTermsAndConditions() {
    let modal = this.modalCtrl.create(TermsAndConditionsPage);
    modal.present();
  }
}
