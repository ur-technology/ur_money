import { NavController, Platform, AlertController, LoadingController} from 'ionic-angular';
import {OnInit, ElementRef, Inject, Component} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import * as _ from 'lodash';
import {AuthService} from '../../../services/auth';
import {ToastService} from '../../../services/toast';
import {AuthenticationCodePage} from '../authentication-code/authentication-code';
import {EmailAddressPage} from '../email-address/email-address';
import {CountryListService} from '../../../services/country-list';
import {TranslateService} from 'ng2-translate/ng2-translate';

declare var jQuery: any, intlTelInputUtils: any, require: any;

@Component({
  selector: 'phone-number-page',
  templateUrl: 'phone-number.html',
})
export class PhoneNumberPage implements OnInit {
  elementRef: ElementRef;
  phoneForm: FormGroup;
  countries: any;
  selectedCountryCode: string;
  selectedCountry: any;

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
    this.elementRef = elementRef;
    this.phoneForm = new FormGroup({
      phone: new FormControl('', (control) => {
        try {
          let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
          let phoneNumberObject = phoneNumberUtil.parse(control.value, this.selectedCountry.countryCode);
          if (!phoneNumberUtil.isValidNumber(phoneNumberObject)) {
            return { 'invalidPhone': true };
          }
        } catch (e) {
          return { 'invalidPhone': true };
        }
      })
    });
    this.selectedCountry = { name: 'United States', telephoneCountryCode: '+1', countryCode: 'US' };
    this.countries = this.countryListService.getCountryData();
  }

  ngOnInit() {
  }

  normalizedPhone(phone) {
    return (phone || '').replace(/\D/g, '');
  }

  submit() {
    let self = this;
    let corePhone = self.normalizedPhone(self.phoneForm.value.phone);
    let mobileAreaCodePrefix = '';
    if (self.selectedCountry.mobileAreaCodePrefix && !corePhone.startsWith(self.selectedCountry.mobileAreaCodePrefix)) {
      mobileAreaCodePrefix = self.selectedCountry.mobileAreaCodePrefix;
    }

    let phone = self.selectedCountry.telephoneCountryCode + mobileAreaCodePrefix + corePhone;
    let loadingModal = self.loadingController.create({
      content: self.translate.instant('pleaseWait'),
      dismissOnPageChange: true
    });

    let taskState: string;
    loadingModal.present().then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      self.auth.phone = phone;
      self.auth.countryCode = self.selectedCountry.countryCode;
      self.auth.email = null;
      return self.auth.requestAuthenticationCode();
    }).then((newTaskState: string) => {
      taskState = newTaskState;
      return loadingModal.dismiss();
    }).then(() => {
      switch (taskState) {
        case 'code_generation_finished':
          self.nav.setRoot(AuthenticationCodePage, { authenticationType: 'sms' });
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
                    this.nav.setRoot(EmailAddressPage);
                  });
                }
              }
            ]
          });
          alert.present();
          break;

        case 'code_generation_canceled_because_user_disabled':
          self.toastService.showMessage({messageKey: 'phone-number.errorUserDisabled'});
          break;

        case 'code_generation_canceled_because_of_excessive_failed_logins':
          self.toastService.showMessage({messageKey: 'phone-number.errorExcessiveLogins'});
          break;

        default:
          self.toastService.showMessage({messageKey: 'phone-number.unexpectedProblem'});
      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({messageKey: error.messageKey === 'noInternetConnection' ? 'noInternetConnection' : 'unexpectedErrorMessage' });
      });
    });
  }

  countrySelect(country) {
    this.selectedCountry = _.find(this.countries, { countryCode: this.selectedCountryCode }) || { name: 'United States', telephoneCountryCode: '+1', countryCode: 'US' };
    jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').focus();
  }
}
