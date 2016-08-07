import {Page, NavController, Alert, Platform, Nav, Popover, Loading} from 'ionic-angular';
import {OnInit, ElementRef, Inject} from '@angular/core';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, AbstractControl} from '@angular/common';
import {AuthService} from '../../services/auth';
import {Registration3Page} from './registration3';
import {LoadingModalComponent} from '../../components/loading-modal/loading-modal';
import {CountryListService} from '../../services/country-list';

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
  constructor( @Inject(ElementRef) elementRef: ElementRef, public platform: Platform, public nav: NavController, public formBuilder: FormBuilder, public auth: AuthService, public loadingModal: LoadingModalComponent, public countryListService: CountryListService) {
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
    let corePhone = this.normalizedPhone(this.phoneForm.value.phone);
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
            this.auth.requestPhoneVerification(phone).then((state: string) => {
              loading.dismiss();
              if (state == "code_generation_completed_and_sms_sent") {
                this.nav.setRoot(Registration3Page, { phone: phone });
              } else if (state == "code_generation_canceled_because_user_not_invited") {
                this.showErrorAlert("Use of UR Money is currently available by invitation only, and you phone number was not on the invitee list.", phoneInput);
              } else {
                this.showErrorAlert("There was an unexpected problem sending the SMS. Please try again later", phoneInput);
              }
            });
          }
        }
      ]
    });
    this.nav.present(alert);

  }

  showErrorAlert(message, phoneInput) {
    // TODO: change this to toast message
    let alert = Alert.create({
      title: "There was a problem...",
      message: message,
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
