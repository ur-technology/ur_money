import {IonicApp, Page, NavController, Alert, Platform, Nav} from 'ionic-angular';
import {OnInit, ElementRef, Inject} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, AbstractControl} from '@angular/common';
import {Auth} from '../../components/auth/auth';
import {Welcome3Page} from './welcome3';
import {CustomValidators} from '../../components/custom-validators/custom-validators';


import {LoadingService} from '../../components/loading-modal/loading-service';

declare var jQuery: any, intlTelInputUtils: any;

@Page({
  templateUrl: 'build/pages/welcome/welcome2.html',
  directives: [FORM_DIRECTIVES]
})
export class Welcome2Page implements OnInit {
  elementRef: ElementRef;
  phoneForm: ControlGroup;
  phoneControl: AbstractControl;

  constructor( @Inject(ElementRef) elementRef: ElementRef, public app: IonicApp, public platform: Platform, public nav: NavController, public formBuilder: FormBuilder, public auth: Auth, public loading: LoadingService) {
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
      excludeCountries: ['cu', 'ir', 'kp', 'sd', 'sy'],
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
            alert.dismiss().then(() => {
              this.loading.show();
            });
            this.auth.requestPhoneVerification(phone).then((result: any) => {
              this.loading.hide();
              if (!result.smsSuccess) {
                console.log("error - sms could not be sent");
                this.showErrorAlert();
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

  showErrorAlert() {
    let alert = Alert.create({
      title: 'Error!',
      message: 'Error while sending sms. Please try again',
      buttons: ['Ok']
    });
    this.nav.present(alert);
  }

}
