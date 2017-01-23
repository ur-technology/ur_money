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
  signUpType: string;
  subheadingTitle = '';
  subheadingButton = '';
  referralCode: string = '';
  sponsor: any;


  constructor(public nav: NavController, private navParams: NavParams, private countryListService: CountryListService, private translate: TranslateService, public modalCtrl: ModalController, public loadingController: LoadingController, public auth: AuthService, public toastService: ToastService, public alertCtrl: AlertController) {
    this.countries = this.countryListService.getCountryData();
    this.signUpType = this.navParams.get('signUpType') || 'referralCode';
    this.referralCode = this.auth.sponsorReferralCode || '';
    this.mainForm = new FormGroup({
      country: new FormControl(this.countryListService.getDefaultContry(), Validators.required),
      referralCode: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, CustomValidator.emailValidator]),
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

  }

  ionViewDidLoad() {
    let self = this;
    this.changeTitlesBySignUpType();
    if (self.referralCode.length > 0) {
      let loadingModal = self.loadingController.create({
        content: self.translate.instant('pleaseWait'),
      });

      loadingModal.present().then(() => {
        self.findSponsor().then((data: any) => {
          if (data.found && !data.disabled) {
            self.sponsor = data;
            self.changeTitlesBySignUpType();
            self.mainForm.controls['referralCode'].setValue(self.referralCode);
          }
          else {
            self.referralCode = '';
          }
          loadingModal.dismiss();
        });
      });
    }
  }

  changeSignUpType() {
    this.signUpType = this.signUpType === 'referralCode' ? 'email' : 'referralCode';
    this.changeTitlesBySignUpType();
  }

  private changeTitlesBySignUpType() {
    if (this.signUpType === 'referralCode') {
      if (this.sponsor) {
        this.subheadingTitle = this.translate.instant('sign-up.headingReferral', { sponsor: this.sponsor.sponsorName });
      }
      this.subheadingButton = this.translate.instant('sign-up.subheadingButtonEmail');
    }
    else {
      this.subheadingButton = this.translate.instant('sign-up.subheadingButtonReferal');
    }
  }

  private normalizedPhone(phone) {
    return (phone || '').replace(/\D/g, '');
  }

  private validateForm(): boolean {
    this.signUpType === 'referralCode' ? this.mainForm.controls['email'].setErrors(null) : this.mainForm.controls['referralCode'].setErrors(null);
    if (!this.mainForm.valid) {
      this.toastService.showMessage({ messageKey: 'sign-up.enterFields' });
      return false;
    }
    return true;
  }

  submit() {
    let self = this;
    if (!self.validateForm()) {
      return;
    }
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
        self.auth.email = null;
      } else {
        self.auth.email = self.mainForm.value.email;
      }
      self.auth.version = 2;
      // return self.auth.requestPhoneRegistration();
      return self.auth.requestAuthenticationCode();
      // }).then((newTaskState: string) => {
      //   switch (newTaskState) {
      //     case 'phone_registration_successful’':
      //       return self.auth.requestAuthenticationCode();
      //     default:
      //       return newTaskState;
      //   }
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
        case 'code_generation_canceled_because_sponsor_not_found':
          self.toastService.showMessage({ messageKey: 'sign-up.sponsorNotFoundMessage' });
          break;
        case 'code_generation_canceled_because_sponsor_disabled':
          self.toastService.showMessage({ messageKey: 'sign-up.sponsorDisabledMessage' });
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

  showInforeRerral() {
    let alerta = this.alertCtrl.create({
      message: this.translate.instant('sign-up.alertInfoReferral'),
      buttons: [{
        text: this.translate.instant('ok'),
        handler: () => {
          alerta.dismiss();
        }
      }
      ]
    });
    alerta.present();
  }

  showInfoEmail() {
    let alerta = this.alertCtrl.create({
      message: this.translate.instant('sign-up.alertInfoEmail'),
      buttons: [{
        text: this.translate.instant('ok'),
        handler: () => {
          alerta.dismiss();
        }
      }
      ]
    });
    alerta.present();
  }

  private findSponsor() {
    let self = this;
    return new Promise((resolve, reject) => {
      if (self.referralCode.length === 0) {
        resolve(null);
        return;
      }
      let taskRef = firebase.database().ref('/sponsorLookupQueue/tasks').push({
        sponsorReferralCode: self.referralCode
      });
      taskRef.then(() => {
        let stateRef = taskRef.child('result');
        stateRef.on('value', (snapshot) => {
          let result: any = snapshot.val();
          if (!result) {
            return;
          }
          stateRef.off('value');
          taskRef.remove();
          resolve(result);

        });
      });
    });
  }
}
