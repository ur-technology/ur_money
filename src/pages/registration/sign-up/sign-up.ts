import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { CountryListService } from '../../../services/country-list';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom';
import { TermsAndConditionsPage } from '../../terms-and-conditions/terms-and-conditions';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { AuthenticationCodePage } from '../authentication-code/authentication-code';
import { SignInPage } from '../sign-in/sign-in';
import { Utils } from '../../../services/utils';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

let prohitedCountryCode: Array<string> = [
  "VN", // Vietnam
  "ID", // Indonesia
  "BY", // Belarus
  "RU", // Russia
  "UA", // Ukraine
];

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html'
})
export class SignUpPage {
  countries: any[];
  mainForm: FormGroup;
  signUpType: string;
  subheadingButton = '';
  countryValid: boolean;
  pageName = 'SignUpPage';

  constructor(
    public nav: NavController,
    private countryListService: CountryListService,
    public modalCtrl: ModalController,
    public loadingController: LoadingController,
    public auth: AuthService,
    public toastService: ToastService,
    public alertCtrl: AlertController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
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

    this.countryValid = this.isCountryValid();
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

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
  }

  ionViewDidLoad() {
    this.changeTitlesBySignUpType();
  }

  changeSignUpType() {
    this.signUpType = this.signUpType === 'sponsorReferralCode' ? 'email' : 'sponsorReferralCode';
    this.googleAnalyticsEventsService.emitEvent(this.pageName, `Changed sign up type - ${this.signUpType}`, 'changeTitlesBySignUpType()');
    this.changeTitlesBySignUpType();

  }

  private changeTitlesBySignUpType() {
    if (this.signUpType === 'sponsorReferralCode') {
      this.mainForm.controls['email'].setErrors(null);
      this.subheadingButton = 'Sign up with email instead';
    } else {
      this.mainForm.controls['sponsorReferralCode'].setErrors(null);
      this.subheadingButton = 'Sign up with referral code instead';
    }
  }

  submit() {
    let self = this;
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Sign up requested', 'submit()');
    let loadingModal = self.loadingController.create({
      content: "Please wait...",
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
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Go to AuthenticationCodePage', 'submit()');
          self.auth.countryCode = this.mainForm.value.country.countryCode;
          self.nav.push(AuthenticationCodePage);
          break;

        case 'code_generation_canceled_because_user_already_signed_up':
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'user Already Exists', 'submit()');
          let alert = this.alertCtrl.create({
            message: "This phone number already exists on our records, please go to sign in page",
            buttons: [
              { text: "Cancel", handler: () => { alert.dismiss(); } },
              {
                text: "Sign In", handler: () => {
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
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'code_generation_canceled_because_voip_phone_not_allowed',  'submit()');
          self.toastService.showMessage({ message: "Signups via a VOIP or other virtual service like Skype and Google voice are not allowed. Please use a number provided by a conventional mobile carrier." });
          break;

        case 'code_generation_canceled_because_email_not_found':
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'code_generation_canceled_because_email_not_found', 'submit()');
          self.toastService.showMessage({ message: "The email that you entered was not found in our records. Please double-check and try again." });
          break;

        case 'code_generation_canceled_because_sponsor_not_found':
        case 'code_generation_canceled_because_sponsor_disabled':
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'sponsor not found', 'submit()');
          self.toastService.showMessage({ message: "There is no sponsor with that referral code, please try another referral code" });
          break;

        default:
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'error unexpectedProblem', 'submit()');
          self.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });

      }
    }, (error) => {
      self.googleAnalyticsEventsService.emitEvent(self.pageName, 'error unexpectedProblem', 'submit()');
      loadingModal.dismiss().then(() => {
        self.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
      });
    });
  }

  openTermsAndConditions() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Open Terms And Conditions Page', 'openTermsAndConditions()');
    let modal = this.modalCtrl.create(TermsAndConditionsPage);
    modal.present();
  }

  showSponsorReferralCodeExplanation() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Sponsor explanation button', 'showSponsorReferralCodeExplanation()');
    let alert = this.alertCtrl.create({
      message: "You need your sponsor's referral code in order to sign up. Please, ask the referral code to your sponsor or click on the invitation link that was sent to you.",
      buttons: [{
        text: "Ok",
        handler: () => {
          alert.dismiss();
        }
      }
      ]
    });
    alert.present();
  }

  showEmailExplanation() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Sponsor explanation button', 'showEmailExplanation()');
    let alert = this.alertCtrl.create({
      message: "If you joined our beta program, enter that email.",
      buttons: [{
        text: "Ok",
        handler: () => {
          alert.dismiss();
        }
      }
      ]
    });
    alert.present();
  }

  onChangeCountry() {
    (<FormControl>this.mainForm.controls['phone']).reset('');

    this.countryValid = this.isCountryValid();
  }

  private isCountryValid(): boolean {
    return !(prohitedCountryCode.indexOf(this.mainForm.value.country.countryCode) > -1);
  }
}
