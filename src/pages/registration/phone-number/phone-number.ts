import { NavController, Platform, AlertController, LoadingController} from 'ionic-angular';
import {ElementRef, Inject, Component} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {AuthService} from '../../../services/auth';
import {ToastService} from '../../../services/toast';
import {AuthenticationCodePage} from '../authentication-code/authentication-code';
import {SignUpPage} from '../sign-up/sign-up'
import {CountryListService} from '../../../services/country-list';
import {TranslateService} from 'ng2-translate/ng2-translate';

declare var jQuery: any;

@Component({
  selector: 'phone-number-page',
  templateUrl: 'phone-number.html',
})
export class PhoneNumberPage {
  elementRef: ElementRef;
  phoneForm: FormGroup;
  countries: any;

  constructor(
    @Inject(ElementRef) elementRef: ElementRef,
    public platform: Platform,
    public nav: NavController,
    public auth: AuthService,
    public alertCtrl: AlertController,
    public countryListService: CountryListService,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public toastService: ToastService
  ) {
    this.countries = this.countryListService.getCountryData();
    this.elementRef = elementRef;
    this.phoneForm = new FormGroup({
      country: new FormControl(this.countryListService.getDefaultContry(), Validators.required),
      phone: new FormControl('', (control) => {
        try {
          let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
          let phoneNumberObject = phoneNumberUtil.parse(control.value, this.phoneForm.value.country.countryCode);
          if (!phoneNumberUtil.isValidNumber(phoneNumberObject)) {
            return { 'invalidPhone': true };
          }
        } catch (e) {
          return { 'invalidPhone': true };
        }
      })
    });
    this.countries = this.countryListService.getCountryData();
  }

  normalizedPhone(phone) {
    return (phone || '').replace(/\D/g, '');
  }

  submit() {
    let self = this;
    let corePhone = self.normalizedPhone(self.phoneForm.value.phone);
    let mobileAreaCodePrefix = '';
    if (self.phoneForm.value.country.mobileAreaCodePrefix && !corePhone.startsWith(self.phoneForm.value.country.mobileAreaCodePrefix)) {
      mobileAreaCodePrefix = self.phoneForm.value.country.mobileAreaCodePrefix;
    }

    let phone = self.phoneForm.value.country.telephoneCountryCode + mobileAreaCodePrefix + corePhone;
    let loadingModal = self.loadingController.create({
      content: self.translate.instant('pleaseWait'),
      dismissOnPageChange: true
    });

    let taskState: string;
    loadingModal.present().then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      self.auth.phone = phone;
      self.auth.countryCode = self.phoneForm.value.country.countryCode;
      return self.auth.requestAuthenticationCode('signIn');
    }).then((newTaskState: string) => {
      taskState = newTaskState;
      return loadingModal.dismiss();
    }).then(() => {
      switch (taskState) {
        case 'code_generation_finished':
          self.nav.setRoot(AuthenticationCodePage, { authenticationType: 'signIn' });
          break;

        case 'code_generation_canceled_because_user_not_invited':
          let alert = this.alertCtrl.create({
            title: this.translate.instant('phone-number.noInviteFoundTitle'),
            message: this.translate.instant('phone-number.noInviteFoundMessage'),
            buttons: [
              { text: this.translate.instant('cancel'), handler: () => { alert.dismiss(); } },
              {
                text: this.translate.instant('phone-number.betaProgramButton'), handler: () => {
                  alert.dismiss().then(() => {
                    self.nav.pop({ animate: false, duration: 0, progressAnimation: false }).then(data => {
                      self.nav.push(SignUpPage, {signUpType: 'email'});
                    });
                  });
                }
              }
            ]
          });
          alert.present();
          break;

        case 'code_generation_canceled_because_user_disabled':
          self.toastService.showMessage({ messageKey: 'phone-number.errorUserDisabled' });
          break;

        case 'code_generation_canceled_because_of_excessive_failed_logins':
          self.toastService.showMessage({ messageKey: 'phone-number.errorExcessiveLogins' });
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

  countrySelect(country) {
    jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').focus();
  }
}
