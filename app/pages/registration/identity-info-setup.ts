import {Page, NavController, AlertController, ToastController, LoadingController} from 'ionic-angular';
import {REACTIVE_FORM_DIRECTIVES, FormGroup, FormControl} from '@angular/forms';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {FocuserDirective} from '../../directives/focuser';
import {AuthService} from '../../services/auth';
import {CustomValidator} from '../../validators/custom';
import {WalletSetupPage} from './wallet-setup';
import {VerificationPendingPage} from './verification-pending';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/registration/identity-info-setup.html',
  directives: [REACTIVE_FORM_DIRECTIVES, FocuserDirective],
  pipes: [TranslatePipe]
})
export class IdentityInfoSetupPage {
  mainForm: FormGroup;
  errorMessage: string;
  verification: any;
  driverLicenseStates: string[];
  driverLicenseState: string;
  identificationTypeControl: any;
  identificationTypes: any[];
  genders: any[];
  identificationType: string;
  dateOfBirth: string;

  constructor(
    public nav: NavController,
    public auth: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,  private translate: TranslateService
  ) {
    this.genders = [
      { name: 'Male', value: 'M' },
      { name: 'Female', value: 'F' }
    ];
    this.identificationTypes = [
      { name: this.nationalIdPlaceholder(), value: 'National Id' },
      { name: 'Passport', value: 'Passport' }
    ];
    if (_.includes(['US', 'AU', 'NZ'], this.auth.currentUser.countryCode)) {
      this.identificationTypes.unshift({ name: 'Driver License', value: 'Driver License' });
    }

    let allStates: any[] = require('provinces');
    let states = _.filter(allStates, (state) => { return state.country === this.auth.currentUser.countryCode; });
    this.driverLicenseStates = _.map(states, (state) => { return state.name; });

    let user = this.auth.currentUser;
    this.identificationType = this.identificationTypes[0].value;

    this.dateOfBirth = 'foo';

    this.verification = {
      'PersonInfo': {
        'FirstGivenName': user.firstName,
        'MiddleName': user.middleName || '',
        'FirstSurName': user.lastName,
        'DayOfBirth': '',
        'MonthOfBirth': '',
        'YearOfBirth': '',
        'Gender': 'M'
      },
      'Location': {
        'AdditionalFields': {
          'Address1': user.address
        },
        'City': user.city,
        'StateProvinceCode': user.stateCode,
        'Country': user.countryCode,
        'PostalCode': user.postalCode
      },
      'Communication': {
        'Telephone': user.phone
      },
      'DriverLicense': {
        'Number': '',
        'State': this.auth.currentUser.stateName,
      },
      'NationalId': {
        'Number': '',
        'Type': 'SocialService'
      },
      'Passport': {
        'Mrz1': '',
        'Mrz2': '',
        'Number': '',
        'DayOfExpiry': '',
        'MonthOfExpiry': '',
        'YearOfExpiry': ''
      }
    };

    let formElements: any = {
      gender: new FormControl('', CustomValidator.nameValidator),
      dateOfBirth: new FormControl('', CustomValidator.nameValidator),
      identificationType: new FormControl('', CustomValidator.nameValidator),
      driverLicenseNumber: new FormControl('', CustomValidator.conditionalNameValidator),
      driverLicenseState: new FormControl('', CustomValidator.conditionalNameValidator),
      nationalIdNumber: new FormControl('', CustomValidator.conditionalNameValidator),
      passportMrz1: new FormControl('', CustomValidator.conditionalNameValidator),
      passportMrz2: new FormControl('', CustomValidator.conditionalNameValidator),
      passportNumber: new FormControl('', CustomValidator.conditionalNameValidator),
      passportExpirationDayOfExpiry: new FormControl('', CustomValidator.conditionalNameValidator),
      passportExpirationMonthOfExpiry: new FormControl('', CustomValidator.conditionalNameValidator),
      passportExpirationYearOfExpiry: new FormControl('', CustomValidator.conditionalNameValidator)
    };
    _.each(formElements, (control, name) => {
      (control as any).name = name;
    });
    let self = this;

    let identificationTypeDriverLicense = () => {
      return self.identificationType === 'Driver License';
    };
    (formElements.driverLicenseNumber as any).controlEnabled = identificationTypeDriverLicense;
    (formElements.driverLicenseState as any).controlEnabled = identificationTypeDriverLicense;

    let identificationTypeNationalId = () => {
      return self.identificationType === 'National Id';
    };
    (formElements.nationalIdNumber as any).controlEnabled = identificationTypeNationalId;

    let identificationTypePassport = () => {
      return self.identificationType === 'Passport';
    };
    (formElements.passportMrz1 as any).controlEnabled = identificationTypePassport;
    (formElements.passportMrz2 as any).controlEnabled = identificationTypePassport;
    (formElements.passportNumber as any).controlEnabled = identificationTypePassport;
    (formElements.passportExpirationDayOfExpiry as any).controlEnabled = identificationTypePassport;
    (formElements.passportExpirationMonthOfExpiry as any).controlEnabled = identificationTypePassport;
    (formElements.passportExpirationYearOfExpiry as any).controlEnabled = identificationTypePassport;

    this.mainForm = new FormGroup(formElements);
  }

  submit() {
    let self = this;
    let loader = self.loadingCtrl.create({
      content: self.translate.instant('pleaseWait'),
      dismissOnPageChange: true
    });
    loader.present();

    let task: any = {
      userId: self.auth.currentUserId,
      verificationArgs: {
        AcceptTruliooTermsAndConditions: true,
        Demo: false,
        CleansedAddress: true,
        ConfigurationName: 'Identity Verification',
        CountryCode: self.verification.Location.Country,
        DataFields: _.pick(self.verification, ['PersonInfo', 'Location', 'Communication'])
      }
    };

    if (self.identificationType === 'Driver License') {
      task.verificationArgs.DataFields.DriverLicence = self.verification.DriverLicense; // NOTE: using Canadian spelling of 'Driver Licence'
    } else if (self.identificationType === 'National Id') {
      task.verificationArgs.DataFields.NationalIds = [ self.verification.NationalId ];
    } else if (self.identificationType === 'Passport') {
      task.verificationArgs.DataFields.Passport = self.verification.Passport;
    };

    let taskRef = firebase.database().ref(`/identityVerificationQueue/tasks`).push(task);
    let resultRef = taskRef.child('result');
    log.debug(`waiting for value at ${resultRef.toString()}`);
    resultRef.on('value', (snapshot) => {
      // wait until result element appears on phoneLookupRef
      let result: any = snapshot.val();
      if (!result) {
        return;
      }
      resultRef.off('value');
      taskRef.remove();
      log.debug(`got value at ${resultRef.toString()}`, result);

      loader.dismiss().then(() => {
        self.auth.reloadCurrentUser().then(() => {
          if (self.auth.currentUser.registration.status === 'verification-succeeded') {
            self.nav.setRoot(WalletSetupPage);
          } else {
            if (self.auth.currentUser.registration.status !== 'verification-pending') {
              console.log(`unexpected registration status ${self.auth.currentUser.registration.status}`);
            }
            self.nav.setRoot(VerificationPendingPage);
          }
        });
      });
    }, (error: any) => {
      loader.dismiss();
      log.warn(`unable to get match results: ${error}`);
    });
  }

  identificationTypeSelected() {
    for (let name in this.mainForm.controls) {
      this.mainForm.controls[name].setErrors(null);
    }
  }

  private nationalIdPlaceholder() {
    if (this.auth.currentUser.countryCode === 'US') {
      return 'Social Security Number';
    } else if (this.auth.currentUser.countryCode === 'CA') {
      return 'Social Insurance Number';
    } else if (this.auth.currentUser.countryCode === 'MX') {
      return 'Número de Credencial de Elector';
    } else {
      return 'National Id Number';
    }
  }

  dobChanged() {
    let dateParts = this.dateOfBirth.split('-');
    if (dateParts.length === 3) {
      this.verification.PersonInfo.YearOfBirth = dateParts[0];
      this.verification.PersonInfo.MonthOfBirth = dateParts[1];
      this.verification.PersonInfo.DayOfBirth = dateParts[2];
    }

  }
}
