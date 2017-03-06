import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { CountryListService } from '../../../services/country-list';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { TermsAndConditionsPage } from '../../terms-and-conditions/terms-and-conditions';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { AuthenticationCodePage } from '../authentication-code/authentication-code';
import { SignInPage } from '../sign-in/sign-in';
import { Utils } from '../../../services/utils';

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html'
})
export class SignUpPage {
  countries: any[];
  mainForm: FormGroup;
  signUpType: string;
  subheadingButton = '';

  constructor(
    public nav: NavController,
    private countryListService: CountryListService,
    private translate: TranslateService,
    public modalCtrl: ModalController,
    public loadingController: LoadingController,
    public auth: AuthService,
    public toastService: ToastService,
    public alertCtrl: AlertController
  ) {

    this.countries = this.countryListService.getCountryData();
    this.signUpType = 'sponsorReferralCode';
    this.mainForm = new FormGroup({
      country: new FormControl(this.countryListService.getDefaultContry(), Validators.required),
      phone: new FormControl('', (control) => {
        return Validators.required(control) || CustomValidator.validatePhoneNumber(this.mainForm.value.country.countryCode, control);
      }),
      sponsorReferralCode: new FormControl(this.extractSponsorReferralCodeFromUrl() || '', (control) => {
        if (this.signUpType === 'sponsorReferralCode') {
          return Validators.required(control) || CustomValidator.validateSponsorReferralCode(control);
        }
      }),
      email: new FormControl('', (control) => {
        if (this.signUpType === 'email') {
          return Validators.required(control) || CustomValidator.emailValidator(control);
        }
      }),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)]),
      passwordConfirmation: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(25)])
    }, CustomValidator.isMatchingPassword);

  }

  private extractSponsorReferralCodeFromUrl() {
    let pathname: string = window.location.pathname || '';
    let matches: string[] = pathname.match(/\/r\/([a-zA-Z0-9]+)/);
    if (!matches || !matches[1]) {
      let params: string = window.location.search || '';
      matches = params.match(/[\?\&]r\=([a-zA-Z0-9]+)/);
    }
    return matches && matches[1];
  }

  ionViewDidLoad() {
    this.changeTitlesBySignUpType();
  }

  changeSignUpType() {
    this.signUpType = this.signUpType === 'sponsorReferralCode' ? 'email' : 'sponsorReferralCode';
    this.changeTitlesBySignUpType();

  }

  private changeTitlesBySignUpType() {
    if (this.signUpType === 'sponsorReferralCode') {
      this.mainForm.controls['email'].setErrors(null);
      this.subheadingButton = this.translate.instant('sign-up.signUpWithEmailCodeInstead');
    } else {
      this.mainForm.controls['sponsorReferralCode'].setErrors(null);
      this.subheadingButton = this.translate.instant('sign-up.signUpWithSponsorReferralCodeInstead');
    }
  }

  submit() {
    let self = this;
    let loadingModal = self.loadingController.create({
      content: self.translate.instant('pleaseWait'),
    });
    let taskState: string;
    loadingModal.present().then(() => {
      return self.auth.requestSignUpCodeGeneration(
        Utils.normalizedPhone(this.mainForm.value.country.telephoneCountryCode, this.mainForm.value.phone, this.mainForm.value.country.mobileAreaCodePrefix),
        self.mainForm.value.password,
        self.signUpType === 'sponsorReferralCode' ? self.mainForm.value.sponsorReferralCode : null,
        self.signUpType === 'email' ? self.mainForm.value.email : null
      );
    }).then((newTaskState: string) => {
      taskState = newTaskState;
      return loadingModal.dismiss();
    }).then(() => {
      switch (taskState) {
        case 'code_generation_finished':
          self.auth.countryCode = this.mainForm.value.country.countryCode;
          self.nav.push(AuthenticationCodePage);
          break;

        case 'code_generation_canceled_because_user_already_signed_up':
          let alert = this.alertCtrl.create({
            message: this.translate.instant('sign-up.userAlreadyExists'),
            buttons: [
              { text: this.translate.instant('cancel'), handler: () => { alert.dismiss(); } },
              {
                text: this.translate.instant('sign-up.gotoSignIn'), handler: () => {
                  alert.dismiss().then(() => {
                    self.nav.pop({ animate: false, duration: 0, progressAnimation: false }).then(data => {
                      self.nav.push(SignInPage);
                    });
                  });
                }
              }
            ]
          });
          alert.present();
          break;

        case 'code_generation_canceled_because_voip_phone_not_allowed':
          self.toastService.showMessage({ messageKey: 'sign-in.unexpectedProblem' });
          break;

        case 'code_generation_canceled_because_email_not_found':
          self.toastService.showMessage({ messageKey: 'sign-up.betaEmailNotFound' });
          break;

        case 'code_generation_canceled_because_sponsor_not_found':
        case 'code_generation_canceled_because_sponsor_disabled':
          self.toastService.showMessage({ messageKey: 'sign-up.sponsorNotFoundMessage' });
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

  onChangeCountry() {
    console.log('onChangeCountry()');
    (<FormControl>this.mainForm.controls['phone']).reset('');
  }
}
