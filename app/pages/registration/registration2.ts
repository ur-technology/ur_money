import {Page, NavController, Alert, Platform, Nav, Popover, Loading} from 'ionic-angular';
import {OnInit, ElementRef, Inject} from '@angular/core';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, AbstractControl} from '@angular/common';
import {Auth} from '../../services/auth';
import {Registration3Page} from './registration3';
import {CustomValidators} from '../../validators/custom-validators';
import {LoadingModal} from '../../components/loading-modal/loading-modal';
import {CountryListService} from '../../services/country-list-service';

declare var jQuery: any, intlTelInputUtils: any, require: any;

@Page({
  templateUrl: 'build/pages/registration/registration2.html',
  directives: [FORM_DIRECTIVES]
})
export class Registration2Page implements OnInit {
  elementRef: ElementRef;
  phoneForm: ControlGroup;
  phoneControl: AbstractControl;
  countries: any;
  selected: any;
  selectedCountry: any;
  constructor( @Inject(ElementRef) elementRef: ElementRef, public platform: Platform, public nav: NavController, public formBuilder: FormBuilder, public auth: Auth, public loadingModal: LoadingModal, public countryListService: CountryListService) {
    this.elementRef = elementRef;
    this.phoneForm = formBuilder.group({
      'phone': ['', (control) => {
        try {
          let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();;
          let phoneNumberObject = phoneNumberUtil.parse(control.value, this.selectedCountry.iso);
          if (!phoneNumberUtil.isValidNumber(phoneNumberObject)) {
            return { 'invalidPhone': true };
          }
        } catch (e) {
          return { 'invalidPhone': true };
        }
      }]
    });
    this.selectedCountry = { name: 'United States', code: '+1', iso: 'US', isoCode: '' };
    this.phoneControl = this.phoneForm.controls['phone'];
    this.countries = this.countryListService.getCountryData();
  }

  ngOnInit() {
  }

  normalizedPhone(phone) {
    return (phone || '').replace(/\D/g, '');
  }

  submit(phoneInput) {
    let corePhone = this.phoneForm.value.phone;
    let extraIsoCode = '';
    if (this.selectedCountry.isoCode && !corePhone.startsWith(this.selectedCountry.isoCode)) {
      extraIsoCode = this.selectedCountry.isoCode;
    }
    let phone = this.selectedCountry.code + extraIsoCode + corePhone
    let alert = Alert.create({
      title: 'NUMBER CONFIRMATION',
      message: "<p>" + phone + "</p><p>Is your phone number above correct?</p>",
      buttons: [
        {
          text: 'EDIT',
          role: 'cancel',
          handler: () => {
            // do nothing
          }
        },
        {
          text: 'YES',
          handler: () => {
            let loading = Loading.create({
              content: "Please wait...",
              dismissOnPageChange: true
            });
            alert.dismiss().then(() => {
              this.nav.present(loading);
            });
            this.auth.requestPhoneVerification(phone).then((result: any) => {
              loading.dismiss();
              if (!result.smsSuccess) {
                log.warn("sms could not be sent");
                this.showErrorAlert(result.smsError, phoneInput);
                return;
              }
              this.nav.setRoot(Registration3Page, { phoneVerificationKey: result.phoneVerificationKey, phone: phone });
            });
          }
        }
      ]
    });
    this.nav.present(alert);

  }

  showErrorAlert(smsError, phoneInput) {
    let alert = Alert.create({
      title: /no matching user found/.test(smsError) ? "Unregistered Phone Number!" : "Unable to Send SMS!",
      message: smsError,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            alert.dismiss().then(() => {
              phoneInput.setFocus();
            })
          }
        }
      ]
    });
    this.nav.present(alert);
  }

  countrySelect(country) {
    this.selectedCountry = _.find(this.countries, { code: this.selected }) || { name: 'United States', code: '+1', iso: 'US', isoCode: '' };
    jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').focus();
  }
}
