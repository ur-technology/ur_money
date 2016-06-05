import {Page, NavController, Alert} from 'ionic-angular';
import {Component, OnInit, ElementRef, Inject} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, AbstractControl} from '@angular/common';
import {Auth} from '../../components/auth/auth';
import {Welcome3Page} from './welcome3';
import {CustomValidators} from '../../components/custom-validators/custom-validators';

declare var jQuery: any, intlTelInputUtils: any;

@Page({
  templateUrl: 'build/pages/welcome/welcome2.html',
  directives: [FORM_DIRECTIVES]
})
export class Welcome2Page implements OnInit {
  elementRef: ElementRef;
  phoneForm: ControlGroup;
  phoneControl: AbstractControl;

  constructor( @Inject(ElementRef) elementRef: ElementRef, public nav: NavController, public formBuilder: FormBuilder, public auth: Auth) {
    this.elementRef = elementRef;
    this.phoneForm = formBuilder.group({
      'phone': ['', (control) => {
        if (control.value.length === 0) {
          jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').blur();
          return { 'invalidPhone': true };
        }
        let isValid = jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').intlTelInput("isValidNumber");
        if (!isValid) {
          return { 'invalidPhone': true };
        }
      }]
    });
    this.phoneControl = this.phoneForm.controls['phone'];
  }

  ngOnInit() {
    jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').intlTelInput({
      autoHideDialCode: false,
      initialCountry: 'us',
      utilsScript: "vendor/js/utils.js"
    });
  }

  normalizedPhone(phone) {
    return (phone || '').replace(/\D/g, '');
  }



  submit() {
    let phone = jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').intlTelInput("getNumber");
    let formattedPhone = jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').intlTelInput("getNumber", intlTelInputUtils.numberFormat.NATIONAL);
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
            alert.dismiss();
            this.auth.requestPhoneVerification(phone).then((result: any) => {
              if (!result || !result.smsSuccess) {
                console.log("error!");
                return;
              }
              this.nav.setRoot(Welcome3Page, { phoneVerificationKey: result.phoneVerificationKey });
            });
          }
        }
      ]
    });
    this.nav.present(alert);

  }

}
