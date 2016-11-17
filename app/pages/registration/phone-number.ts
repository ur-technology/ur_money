import {Page, NavController, Platform, AlertController, LoadingController} from 'ionic-angular';
import {OnInit, ElementRef, Inject} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import * as _ from 'lodash';
import {AuthService} from '../../services/auth';
import {ToastService} from '../../services/toast';
import {AuthenticationCodePage} from './authentication-code';
import {EmailAddressPage} from './email-address';
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
    private alertCtrl: AlertController,
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
    this.selectedCountry = { name: 'United States', code: '+1', iso: 'US' };
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

    let phone = self.selectedCountry.code + mobileAreaCodePrefix + corePhone;
    let loadingModal = self.loadingController.create({
      content: self.translate.instant('pleaseWait'),
      dismissOnPageChange: true
    });

    let taskState: string;

    loadingModal.present().then(() => {
      return self.auth.checkFirebaseConnection();
    }).then(() => {
      return self.auth.requestSmsAuthenticationCode(phone, self.selectedCountry.code, self.selectedCountry.iso);
    }).then((newTaskState: string) => {
      taskState = newTaskState;
      return loadingModal.dismiss();
    }).then(() => {
      switch (taskState) {
        case 'completed':
          self.nav.setRoot(AuthenticationCodePage, { authenticationType: 'sms' });
          break;

        case 'canceled_because_user_not_invited':
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

        case 'canceled_because_user_disabled':
          self.toastService.showMessage({messageKey: 'phone-number.errorUserDisabled'});
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
    this.selectedCountry = _.find(this.countries, { code: this.selected }) || { name: 'United States', code: '+1', iso: 'US' };
    jQuery(this.elementRef.nativeElement).find('.phone-input .text-input').focus();
  }
}
