import {Page, NavController, Alert, Platform, Nav, Popover} from 'ionic-angular';
import {OnInit, ElementRef, Inject} from '@angular/core';

import {FORM_DIRECTIVES, FormBuilder, ControlGroup, AbstractControl} from '@angular/common';
import {Auth} from '../../components/auth/auth';
import {Registration3Page} from './registration3';
import {CustomValidators} from '../../components/custom-validators/custom-validators';
import {LoadingModal} from '../../components/loading-modal/loading-modal';

import {CountryPopover} from '../../components/country-popover/country-popover';
import {CountryPopoverService} from '../../components/country-popover/country-popover.service';

declare var jQuery: any, intlTelInputUtils: any, require: any;

import libphonenumber = require('google-libphonenumber');
const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();


@Page({
  templateUrl: 'build/pages/registration/registration2.html',
  directives: [FORM_DIRECTIVES]
})
export class Registration2Page implements OnInit {
  elementRef: ElementRef;
  phoneForm: ControlGroup;
  phoneControl: AbstractControl;
  selectedCountry = { name: 'United States', code: '+1', iso: 'US' };
  constructor( @Inject(ElementRef) elementRef: ElementRef, public platform: Platform, public nav: NavController, public formBuilder: FormBuilder, public auth: Auth, public loadingModal: LoadingModal, public countryPopoverService: CountryPopoverService) {
    this.elementRef = elementRef;
    this.phoneForm = formBuilder.group({
      'phone': ['', (control) => {
        if (control.value.length === 0) {
          return { 'invalidPhone': true };
        }
        try {
          if (this.selectedCountry.iso == 'MX') {
            let controlValue = control.value;
            if (!controlValue.match(/^[1]/)) {
              return { 'invalidPhone': true };
            }
          }
          let swissNumberProto = phoneUtil.parse(control.value, this.selectedCountry.iso);
          let isValid = phoneUtil.isValidNumber(swissNumberProto);
          if (!isValid) {
            return { 'invalidPhone': true };
          }
        } catch (e) {
          return { 'invalidPhone': true };
        }
      }]
    });
    this.phoneControl = this.phoneForm.controls['phone'];
    this.countryPopoverService.countrySelectedEmitter.subscribe((country) => {
      this.countrySelect(country);
    });
  }

  ngOnInit() {
  }


  normalizedPhone(phone) {
    return (phone || '').replace(/\D/g, '');
  }



  submit() {
    let phone = this.selectedCountry.code + this.phoneForm.value.phone; // jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').intlTelInput("getNumber");
    let formattedPhone = phone; // jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').intlTelInput("getNumber", intlTelInputUtils.numberFormat.NATIONAL);
    let alert = Alert.create({
      title: 'NUMBER CONFIRMATION',
      message: "<p>" + formattedPhone + "</p><p>Is your phone number above correct?</p>",
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
            alert.dismiss().then(() => {
              this.loadingModal.show();
            });
            this.auth.requestPhoneVerification(phone).then((result: any) => {
              this.loadingModal.hide();
              if (!result.smsSuccess) {
                console.log("error - sms could not be sent");
                this.showErrorAlert(result.smsError);
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

  showErrorAlert(title, message) {
    let alert = Alert.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            // do nothing
          }
        }
      ]
    });
    this.nav.present(alert);
  }

  openCountryPopover(ev) {
    let popover = Popover.create(CountryPopover, {
    });
    this.nav.present(popover, {
      ev: ev
    });
  }

  countrySelect(country) {
    this.selectedCountry = country;
    jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').focus();
  }

}
