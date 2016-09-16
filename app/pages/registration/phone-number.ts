import {Page, NavController, AlertController, Platform, Nav, Popover, LoadingController, ToastController } from 'ionic-angular';
import {OnInit, ElementRef, Inject} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {ControlGroup, AbstractControl} from '@angular/common';
import {AuthService} from '../../services/auth';
import {VerificationSmsCodePage} from './verification-sms-code';
import {CountryNotSupportedPage} from './country-not-supported';
import {LoadingModalComponent} from '../../components/loading-modal/loading-modal';
import {CountryListService} from '../../services/country-list';
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";

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
  constructor( @Inject(ElementRef) elementRef: ElementRef, public platform: Platform, public nav: NavController, public auth: AuthService, public loadingModal: LoadingModalComponent, public countryListService: CountryListService, private alertCtrl: AlertController, private loadingController: LoadingController, private toastCtrl: ToastController, private translate: TranslateService) {
    this.elementRef = elementRef;
    this.phoneForm = new FormGroup({
      phone: new FormControl('', (control) => {
        try {
          let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();;
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
    let corePhone = this.normalizedPhone(this.phoneForm.value.phone);
    let extraIsoCode = '';
    if (this.selectedCountry.isoCode && !corePhone.startsWith(this.selectedCountry.isoCode)) {
      extraIsoCode = this.selectedCountry.isoCode;
    }

    let phone = this.selectedCountry.code + extraIsoCode + corePhone
    let alert = this.alertCtrl.create({
      title: this.translate.instant("phone-number.numberConfirmation"),
      message: "<p>" + phone + "</p><p>"+this.translate.instant("phone-number.phoneCorrect")+"</p>",
      buttons: [
        {
          text: this.translate.instant("edit"),
          role: 'cancel',
          handler: () => {
            // do nothing
          }
        },
        {
          text: this.translate.instant("yes"),
          handler: () => {
            alert.dismiss().then(() => {
              let loading = this.loadingController.create({
                content: this.translate.instant("pleaseWait"),
                dismissOnPageChange: true
              });
              loading.present();

              this.auth.requestPhoneVerification(phone, this.selectedCountry.code).then((state: string) => {
                loading.dismiss().then(() => {
                  if (state === "code_generation_canceled_because_user_from_not_supported_country") {
                    this.nav.setRoot(CountryNotSupportedPage);
                  } else if (state === "code_generation_completed_and_sms_sent") {
                    this.nav.setRoot(VerificationSmsCodePage, { phone: phone, countryCode: this.selectedCountry.code });
                  } else if (state === "code_generation_canceled_because_user_not_invited") {
                    this.showErrorAlert(this.translate.instant("phone-number.errorInvitation"), phoneInput);
                  } else {
                    this.showErrorAlert(this.translate.instant("phone-number.errorSms"), phoneInput);
                  }
                });
              });
            });
          }
        }
      ]
    });
    alert.present();

  }

  showErrorAlert(message, phoneInput) {
    let toast = this.toastCtrl.create({
      message: message, duration: 9000, position: 'bottom'
    });
    toast.present();
    phoneInput.setFocus();
  }

  countrySelect(country) {
    this.selectedCountry = _.find(this.countries, { code: this.selected }) || { name: 'United States', code: '+1', iso: 'US', isoCode: '' };
    jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').focus();
  }
}
