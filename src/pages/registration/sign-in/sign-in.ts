import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { CountryListService } from '../../../services/country-list';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { TermsAndConditionsPage } from '../../terms-and-conditions/terms-and-conditions';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { SignUpPage } from '../sign-up/sign-up';
import { CustomValidator } from '../../../validators/custom';
import { Utils } from '../../../services/utils';
import { SignInPasswordPage } from '../sign-in-password/sign-in-password';

@Component({
  selector: 'page-sign-in',
  templateUrl: 'sign-in.html'
})
export class SignInPage {
  countries: any[];
  mainForm: FormGroup;

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
    this.mainForm = new FormGroup({
      country: new FormControl(this.countryListService.getDefaultContry(), Validators.required),
      phone: new FormControl('', (control) => {
        return Validators.required(control) || CustomValidator.validatePhoneNumber(this.mainForm.value.country.countryCode, control);
      })
    });

  }

  submit() {
    let self = this;
    let phone = Utils.normalizedPhone(this.mainForm.value.country.telephoneCountryCode, this.mainForm.value.phone, this.mainForm.value.country.mobileAreaCodePrefix);
    let loadingModal = self.loadingController.create({
      content: self.translate.instant('pleaseWait'),
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
        case 'request_sign_in_completed':
          self.nav.push(SignInPasswordPage, { phone: phone });
          break;

        case 'request_sign_in_canceled_because_user_not_found':
          let alert = this.alertCtrl.create({
            message: this.translate.instant('sign-in.userNotFound'),
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

        case 'request_sign_in_canceled_because_user_disabled':
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

}
