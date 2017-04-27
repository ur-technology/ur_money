import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { CountryListService } from '../../../services/country-list';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TermsAndConditionsPage } from '../../terms-and-conditions/terms-and-conditions';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { SignUpPage } from '../sign-up/sign-up';
import { CustomValidator } from '../../../validators/custom';
import { Utils } from '../../../services/utils';
import { SignInPasswordPage } from '../sign-in-password/sign-in-password';
import { SignInTemporaryCodePage } from '../sign-in-temporary-code/sign-in-temporary-code';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

declare var trackJs: any;

@Component({
  selector: 'page-sign-in',
  templateUrl: 'sign-in.html'
})
export class SignInPage {
  countries: any[];
  mainForm: FormGroup;
  pageName = 'SignInPage';

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
    this.mainForm = new FormGroup({
      country: new FormControl(this.countryListService.getDefaultContry(), Validators.required),
      phone: new FormControl('', (control) => {
        return Validators.required(control) || CustomValidator.validatePhoneNumber(this.mainForm.value.country.countryCode, control);
      })
    });

  }

  ionViewDidLoad(){
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  submit() {
    let self = this;
    let phone = Utils.normalizedPhone(this.mainForm.value.country.telephoneCountryCode, this.mainForm.value.phone, this.mainForm.value.country.mobileAreaCodePrefix);
    self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Clicked sign In button', `Phone: ${phone} - submit()`);
    let loadingModal = self.loadingController.create({
      content: "Please wait...",
    });
    let taskState: string;
    loadingModal.present().then(() => {
      return self.auth.requestSignIn(
        phone
      );
    }).then((newTaskState: string) => {
      taskState = newTaskState;
      return loadingModal.dismiss();
    }).then(() => {
      switch (taskState) {
        case 'request_sign_in_succeded':
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Going to SignInPasswordPage', `Phone: ${phone} - submit()`);
          self.nav.push(SignInPasswordPage, { phone: phone });
          break;

        case 'request_sign_in_canceled_because_user_does_not_have_password_set':
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Going to SignInTemporaryCodePage', `Phone: ${phone} - submit()`);
          self.nav.push(SignInTemporaryCodePage, { phone: phone });
          break;

        case 'request_sign_in_canceled_because_user_not_found':
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Login failed: user not found', `Phone: ${phone} - submit()`);
          trackJs.track('Login failed: user not found');
          let alert = this.alertCtrl.create({
            message: "The number that you entered did not match our records. Please double-check and try again.",
            buttons: [
              { text: "Cancel", handler: () => { alert.dismiss(); } },
              {
                text: "Sign up instead?", handler: () => {
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

        case 'request_sign_in_canceled_because_user_disabled':
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Error user disabled', `Phone: ${phone} - submit()`);
          self.toastService.showMessage({ message: 'Your user account has been disabled.' });
          break;

        default:
          self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Login failed: unexpected problem', `Phone: ${phone} - submit()`);
          trackJs.track('Login failed: unexpected problem');
          self.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });

      }
    }, (error) => {
      loadingModal.dismiss().then(() => {
        self.googleAnalyticsEventsService.emitEvent(self.pageName, 'Login failed: unexpected problem', `Phone: ${phone} - submit()`);
        trackJs.track('Login failed: unexpected problem');
        self.toastService.showMessage({ message: 'There was an unexpected problem. Please try again later' });
      });
    });
  }

  openTermsAndConditions() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Open terms-and-conditions page', 'openTermsAndConditions()');
    let modal = this.modalCtrl.create(TermsAndConditionsPage);
    modal.present();
  }

  onChangeCountry() {
    (<FormControl>this.mainForm.controls['phone']).reset('');
  }
}
