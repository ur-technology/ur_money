import {ViewChild, ElementRef, Inject} from '@angular/core';
import {Page, NavController, Platform, AlertController, ToastController} from 'ionic-angular';
import {REACTIVE_FORM_DIRECTIVES, FormGroup, FormControl, Validators} from '@angular/forms';
import {AngularFire} from 'angularfire2'
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";

import {FocuserDirective} from '../../directives/focuser';
import {UserModel} from '../../models/user';
import {WalletModel} from '../../models/wallet';
import {AuthService} from '../../services/auth';
import {DeviceIdentityService} from '../../services/device-identity';
import {CustomValidator} from '../../validators/custom';
import {LoadingModalComponent} from '../../components/loading-modal/loading-modal';

import {WalletSetupPage} from './wallet-setup';
import {VerificationPendingPage} from './verification-pending';
import {HomePage} from '../home/home';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/registration/identity-verification.html',
  directives: [REACTIVE_FORM_DIRECTIVES, FocuserDirective],
  pipes: [TranslatePipe]
})
export class IdentityVerificationPage {
  mainForm: FormGroup;
  errorMessage: string;
  verification: any;
  driverLicenseStates: string[];
  driverLicenseState: string;
  identificationTypeControl: any;
  identificationTypes: any[];
  genders: any[];
  identificationType: string;

  constructor(
    public nav: NavController,
    public auth: AuthService,
    public loadingModal: LoadingModalComponent,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.genders = [
      { name: 'Male', value: 'M' },
      { name: 'Female', value: 'F' }
    ];
    this.identificationTypes = [
      { name: this.nationalIdPlaceholder(), value: 'National Id' },
      { name: 'Passport', value: 'Passport' }
    ];
    if (_.includes(["US", "AU", "NZ"], this.auth.currentUser.countryCode)) {
      this.identificationTypes.unshift({ name: 'Driver License', value: 'Driver License' });
    }

    let allStates: any[] = require('provinces');
    let states = _.filter(allStates, (state) => { return state.country == this.auth.currentUser.countryCode; });
    this.driverLicenseStates = _.map(states, (state) => { return state.name; });

    let user = this.auth.currentUser;
    this.identificationType = this.identificationTypes[0].value;

    this.verification = {
      "PersonInfo": {
        "FirstGivenName": user.firstName,
        "MiddleName": user.middleName || '',
        "FirstSurName": user.lastName,
        "DayOfBirth": '',
        "MonthOfBirth": '',
        "YearOfBirth": '',
        "Gender": 'M'
      },
      "Location": {
        "AdditionalFields": {
          "Address1": user.address
        },
        "City": user.city,
        "StateProvinceCode": user.stateCode,
        "Country": user.countryCode,
        "PostalCode": user.postalCode
      },
      "Communication": {
        "Telephone": user.phone
      },
      "DriverLicense": {
        "Number": '',
        "State": this.auth.currentUser.stateName,
      },
      "NationalId": {
        "Number": '',
        "Type": 'SocialService'
      },
      "Passport": {
        "Mrz1": "",
        "Mrz2": "",
        "Number": "",
        "DayOfExpiry": '',
        "MonthOfExpiry": '',
        "YearOfExpiry": ''
      }
    };

    let formElements: any = {
      gender: new FormControl("", CustomValidator.nameValidator),
      dayOfBirth: new FormControl("", CustomValidator.nameValidator),
      monthOfBirth: new FormControl("", CustomValidator.nameValidator),
      yearOfBirth: new FormControl("", CustomValidator.nameValidator),
      identificationType: new FormControl("", CustomValidator.nameValidator),
      driverLicenseNumber: new FormControl("", CustomValidator.conditionalNameValidator),
      driverLicenseState: new FormControl("", CustomValidator.conditionalNameValidator),
      nationalIdNumber: new FormControl("", CustomValidator.conditionalNameValidator),
      passportMrz1: new FormControl("", CustomValidator.conditionalNameValidator),
      passportMrz2: new FormControl("", CustomValidator.conditionalNameValidator),
      passportNumber: new FormControl("", CustomValidator.conditionalNameValidator),
      passportDayOfExpiry: new FormControl("", CustomValidator.conditionalNameValidator),
      passportMonthOfExpiry: new FormControl("", CustomValidator.conditionalNameValidator),
      passportYearOfExpiry: new FormControl("", CustomValidator.conditionalNameValidator)
    };
    _.each(formElements, (control, name) => {
      (control as any).name = name;
    });
    let self = this;

    let identificationTypeDriverLicense = () => {
      return self.identificationType == 'Driver License';
    };
    (formElements.driverLicenseNumber as any).controlEnabled = identificationTypeDriverLicense;
    (formElements.driverLicenseState as any).controlEnabled = identificationTypeDriverLicense;

    let identificationTypeNationalId = () => {
      return self.identificationType == 'National Id';
    };
    (formElements.nationalIdNumber as any).controlEnabled = identificationTypeNationalId;

    let identificationTypePassport = () => {
      return self.identificationType == 'Passport';
    };
    (formElements.passportMrz1 as any).controlEnabled = identificationTypePassport;
    (formElements.passportMrz2 as any).controlEnabled = identificationTypePassport;
    (formElements.passportNumber as any).controlEnabled = identificationTypePassport;
    (formElements.passportDayOfExpiry as any).controlEnabled = identificationTypePassport;
    (formElements.passportMonthOfExpiry as any).controlEnabled = identificationTypePassport;
    (formElements.passportYearOfExpiry as any).controlEnabled = identificationTypePassport;

    this.mainForm = new FormGroup(formElements);
  }

  submit() {
    this.loadingModal.show();

    let task: any = _.pick(this.verification, ['PersonInfo', 'Location', 'Communication']);
    if (this.identificationType == 'Driver License') {
      task.DriverLicence = this.verification.DriverLicense; // note Canadian spelling of 'Driver Licence'
    } else if (this.identificationType == 'National Id') {
      task.NationalIds = [ this.verification.NationalId ];
    } else if (this.identificationType == 'Passport') {
      task.Passport = this.verification.Passport;
    };
    task.userId = this.auth.currentUserId;
    task.wallet = this.auth.currentUser.wallet;
    let taskRef = firebase.database().ref(`/identityVerificationQueue/tasks/${this.auth.currentUserId}`);
    taskRef.set(task);
    let resultRef = taskRef.child('result');
    log.debug(`waiting for value at ${resultRef.toString()}`)
    resultRef.on('value', (snapshot) => {

      // wait until result element appears on phoneLookupRef
      let result: any = snapshot.val();
      if (!result) {
        return;
      }
      resultRef.off('value');
      taskRef.remove();
      log.debug(`got value at ${resultRef.toString()}`, result)

      this.loadingModal.hide();

      if (result.RecordStatus == "match") {
        this.auth.reloadCurrentUser();
        this.nav.setRoot(WalletSetupPage);
      } else {
        this.nav.setRoot(VerificationPendingPage);
      }
    }, (error) => {
      this.loadingModal.hide();
      log.warn(`unable to get match results: ${error}`);
    });
  }

  driverLicenseStateSelected() {
    this.verification.DriverLicense.State = this.driverLicenseState;
  }

  identificationTypeSelected() {
    for (let name in this.mainForm.controls) {
      this.mainForm.controls[name].setErrors(null);
    }
  }

  private nationalIdPlaceholder() {
    if (this.auth.currentUser.countryCode == 'US') {
      return 'Social Security Number';
    } else if (this.auth.currentUser.countryCode == 'CA') {
      return 'Social Insurance Number';
    } else if (this.auth.currentUser.countryCode == 'MX') {
      return 'Número de Credencial de Elector';
    } else {
      return 'National Id Number';
    }
  }

}
