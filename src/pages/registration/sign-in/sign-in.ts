import { Component } from '@angular/core';
import { Platform, NavController, NavParams, ModalController, LoadingController, AlertController } from 'ionic-angular';
// import {Deeplinks} from 'ionic-native';
import { CountryListService } from '../../../services/country-list';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { TermsAndConditionsPage } from '../../terms-and-conditions/terms-and-conditions';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { SignUpPage } from '../sign-up/sign-up';
import { HomePage } from '../..//home/home';
// import * as log from 'loglevel';

@Component({
  selector: 'page-sign-in',
  templateUrl: 'sign-in.html'
})
export class SignInPage {
  countries: any[];
  mainForm: FormGroup;
  password: string;

  constructor(
    public nav: NavController,
    private navParams: NavParams,
    private countryListService: CountryListService,
    private translate: TranslateService,
    public modalCtrl: ModalController,
    public loadingController: LoadingController,
    public auth: AuthService,
    public toastService: ToastService,
    public alertCtrl: AlertController,
    public platform: Platform
  ) {
    this.countries = this.countryListService.getCountryData();
    this.mainForm = new FormGroup({
      country: new FormControl(this.countryListService.getDefaultContry(), Validators.required),
      phone: new FormControl('', (control) => {
        let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
        let phoneNumberObject;
        try {
          phoneNumberObject = phoneNumberUtil.parse(control.value, this.mainForm.value.country.countryCode);
        } catch (e) { }
        if (!phoneNumberObject || !phoneNumberUtil.isValidNumber(phoneNumberObject)) {
          return { 'invalidPhone': true };
        }
      }),
      password: new FormControl('', [Validators.required])
    });

  }

  private normalizedPhone(): string {
    let strippedPhone: string = (this.mainForm.value.phone || '').replace(/\D/g, '');
    let extraPrefix: string = this.mainForm.value.country.mobileAreaCodePrefix || '';
    if (extraPrefix && strippedPhone.startsWith(extraPrefix)) {
      extraPrefix = '';
    }
    return this.mainForm.value.country.telephoneCountryCode + extraPrefix + strippedPhone;
  }

  submit() {
    let self = this;
    let loadingModal = self.loadingController.create({
      content: self.translate.instant('pleaseWait'),
    });
    let taskState: string;
    loadingModal.present().then(() => {
      return self.auth.signIn(
        self.normalizedPhone(),
        self.mainForm.value.password
      );
    }).then((newTaskState: string) => {
      taskState = newTaskState;
      return loadingModal.dismiss();
    }).then(() => {
      switch (taskState) {
        case 'sign_in_finished':
          self.nav.setRoot(HomePage);
          break;

        case 'sign_in_canceled_because_user_not_found':
          let alert = this.alertCtrl.create({
            message: this.translate.instant('sign-up.userNotFound'),
            buttons: [
              { text: this.translate.instant('cancel'), handler: () => { alert.dismiss(); } },
              {
                text: this.translate.instant('sign-in.gotoSignUp'), handler: () => {
                  alert.dismiss().then(() => {
                    self.nav.pop({ animate: false, duration: 0, progressAnimation: false }).then(data => {
                      self.nav.push(SignUpPage);
                    });
                  });
                }
              }
            ]
          });
          alert.present();
          break;

        case 'sign_in_canceled_because_user_disabled':
          self.toastService.showMessage({ messageKey: 'sign-in.userDisabled' });
          break;

        default:
          self.toastService.showMessage({ messageKey: 'sign-in.unexpectedProblem' });

      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({ messageKey: 'sign-in.unexpectedProblem' });
      });
    });
  }

  openTermsAndConditions() {
    let modal = this.modalCtrl.create(TermsAndConditionsPage);
    modal.present();
  }

  showSponsorReferralCodeExplanation() {
    let alert = this.alertCtrl.create({
      message: this.translate.instant('sign-up.sponsorReferralCodeExplanation'),
      buttons: [{
        text: this.translate.instant('ok'),
        handler: () => {
          alert.dismiss();
        }
      }
      ]
    });
    alert.present();
  }

  showEmailExplanation() {
    let alert = this.alertCtrl.create({
      message: this.translate.instant('sign-up.emailExplanation'),
      buttons: [{
        text: this.translate.instant('ok'),
        handler: () => {
          alert.dismiss();
        }
      }
      ]
    });
    alert.present();
  }
}
