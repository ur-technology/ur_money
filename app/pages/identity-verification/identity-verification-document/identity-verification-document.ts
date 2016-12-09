import {NgZone, Component, ViewChild } from '@angular/core';
import { NavController, Content} from 'ionic-angular';
import {FormGroup, FormControl} from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {AuthService} from '../../../services/auth';
import {CustomValidator} from '../../../validators/custom';
import {KeyboardAttachDirective} from '../../../directives/keyboard-attach.directive';
import {IdentityVerificationSummaryPage} from '../identity-verification-summary/identity-verification-summary';

@Component({
  templateUrl: 'build/pages/identity-verification/identity-verification-document/identity-verification-document.html',
  directives: [KeyboardAttachDirective],
  pipes: [TranslatePipe]
})
export class IdentityVerificationDocumentPage {
  mainForm: FormGroup;
  errorMessage: string;
  verification: any;
  driverLicenseStates: string[];
  driverLicenseState: string;
  identificationTypeControl: any;
  identificationTypes: any[] = [];
  identificationType: string;
  @ViewChild(Content) content: Content;

  constructor(
    public nav: NavController,
    public auth: AuthService,
    private ngZone: NgZone
  ) {


    this.fillIdentificationTypesList();

    let allStates: any[] = require('provinces');
    let states = _.filter(allStates, (state) => { return state.country === this.auth.currentUser.countryCode; });
    this.driverLicenseStates = _.map(states, (state) => { return state.name; });

    let user = this.auth.currentUser;
    this.identificationType = this.identificationTypes[0].value;


    this.verification = {
      'PersonInfo': {
        'FirstGivenName': user.firstName,
        'MiddleName': user.middleName || '',
        'FirstSurName': user.lastName,
        'DayOfBirth': moment(user.dateOfBirth, 'MM/DD/YYYY').date(),
        'MonthOfBirth': moment(user.dateOfBirth, 'MM/DD/YYYY').month() + 1,
        'YearOfBirth': moment(user.dateOfBirth, 'MM/DD/YYYY').year(),
        'Gender': user.gender
      },
      'Location': {
        'BuildingNumber': user.buildingNumber,
        'StreetName': user.streetName,
        'City': user.city,
        'StateProvinceCode': user.stateCode ? user.stateCode : user.stateName,
        'Country': user.countryCode,
        'PostalCode': user.postalCode,
        'StreetType': user.streetType
      },
      'Communication': {
        'Telephone': user.phone
      },
      'DriverLicense': {
        'Number': '',
        'State': user.stateName,
      },
      'NationalId': {
        'Number': '',
        'Type': ''
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

  fillIdentificationTypesList() {
    _.forIn(this.auth.supportedCountries()[this.auth.currentUser.countryCode].validationTypes, (value, key) => {
      this.identificationTypes.push({ name: value.displayName, value: key });
    });
  }

  submit() {
    let self = this;

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
      self.verification.NationalId.Type = self.getNationalIdType();
      task.verificationArgs.DataFields.NationalIds = [self.verification.NationalId];
    } else if (self.identificationType === 'Passport') {
      task.verificationArgs.DataFields.Passport = self.verification.Passport;
    };
    this.verification.Location.AdditionalFields = { Address1: `${this.verification.Location.BuildingNumber} ${this.verification.Location.StreetName}` };

    this.addCountrySpecificFields();
    this.nav.push(IdentityVerificationSummaryPage, { summaryData: task });
  }

  addCountrySpecificFields() {
    this.verification.PersonInfo.AdditionalFields = { FullName: `${this.verification.PersonInfo.FirstSurName} ${this.verification.PersonInfo.FirstGivenName}` };
    if (this.auth.currentUser.suburb) {
      this.verification.Location.Suburb = this.auth.currentUser.suburb;
    }
  }

  getNationalIdType() {
    return this.auth.supportedCountries()[this.auth.currentUser.countryCode]['National Id'].type;
  }

  identificationTypeSelected() {
    for (let name in this.mainForm.controls) {
      this.mainForm.controls[name].setErrors(null);
    }
  }



  focusInput() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 500);
  }
}
