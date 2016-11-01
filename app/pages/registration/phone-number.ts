import {Page, NavController, Platform, LoadingController} from 'ionic-angular';
import {OnInit, ElementRef, Inject} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import * as _ from 'lodash';
import {AuthService} from '../../services/auth';
import {ToastService} from '../../services/toast';
import {VerificationSmsCodePage} from './verification-sms-code';
import {CountryNotSupportedPage} from './country-not-supported';
import {CountryListService} from '../../services/country-list';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';

declare var jQuery: any, intlTelInputUtils: any, require: any;

@Page({
  templateUrl: 'build/pages/registration/phone-number.html',
  pipes: [TranslatePipe]
})
export class PhoneNumberPage implements OnInit {
  elementRef: ElementRef;
  phoneForm: FormGroup;
  countries: any;
  selected: any;
  selectedCountry: any;

  constructor(
    @Inject(ElementRef) elementRef: ElementRef,
    public platform: Platform,
    public nav: NavController,
    public auth: AuthService,
    public countryListService: CountryListService,
    private loadingController: LoadingController,
    private translate: TranslateService,
    private toastService: ToastService
  ) {
    this.elementRef = elementRef;
    this.phoneForm = new FormGroup({
      phone: new FormControl('', (control) => {
        try {
          let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
          let phoneNumberObject = phoneNumberUtil.parse(control.value, this.selectedCountry.iso);
          if (!phoneNumberUtil.isValidNumber(phoneNumberObject)) {
            return { 'invalidPhone': true };
          }
        } catch (e) {
          return { 'invalidPhone': true };
        }
      })
    });
    this.selectedCountry = { name: 'United States', code: '+1', iso: 'US', isoCode: '' };
    this.countries = this.countryListService.getCountryData();
  }

  ngOnInit() {
  }

  normalizedPhone(phone) {
    return (phone || '').replace(/\D/g, '');
  }

  submit(phoneInput) {
    let self = this;
    let corePhone = self.normalizedPhone(self.phoneForm.value.phone);
    let extraIsoCode = '';
    if (self.selectedCountry.isoCode && !corePhone.startsWith(self.selectedCountry.isoCode)) {
      extraIsoCode = self.selectedCountry.isoCode;
    }

    let phone = self.selectedCountry.code + extraIsoCode + corePhone;
    let loadingModal = self.loadingController.create({
      content: self.translate.instant('pleaseWait'),
      dismissOnPageChange: true
    });

    let taskState: string;

    loadingModal.present().then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      return self.auth.requestPhoneVerification(phone, self.selectedCountry.code);
    }).then((newTaskState: string) => {
      taskState = newTaskState;
      return loadingModal.dismiss();
    }).then(() => {
      if (taskState === 'code_generation_canceled_because_user_from_not_supported_country') {
        self.nav.setRoot(CountryNotSupportedPage);
      } else if (taskState === 'code_generation_completed_and_sms_sent') {
        self.nav.setRoot(VerificationSmsCodePage, { phone: phone, countryCode: self.selectedCountry.code });
      } else if (taskState === 'code_generation_canceled_because_user_not_invited') {
        self.toastService.showMessage({messageKey: 'phone-number.errorInvitation'});
      } else {
        self.toastService.showMessage({messageKey: 'phone-number.errorSms'});
      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({messageKey: error.messageKey === 'noInternetConnection' ? 'noInternetConnection' : 'unexpectedErrorMessage' });
      });
    });
  }

  countrySelect(country) {
    this.selectedCountry = _.find(this.countries, { code: this.selected }) || { name: 'United States', code: '+1', iso: 'US', isoCode: '' };
    jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').focus();
  }
}
