import {NgZone, Component, ViewChild } from '@angular/core';
import { NavController, Content} from 'ionic-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {AuthService} from '../../../services/auth';
import {CustomValidator} from '../../../validators/custom';
import {KeyboardAttachDirective} from '../../../directives/keyboard-attach.directive';
import { DatePicker } from 'ionic-native';
import * as moment from 'moment';
import {IdentityVerificationSummaryPage} from '../identity-verification-summary/identity-verification-summary';

@Component({
  templateUrl: 'build/pages/identity-verification/identity-verification-trulio/identity-verification-trulio.html',
  directives: [KeyboardAttachDirective],
  pipes: [TranslatePipe]
})
export class IdentityVerificationTrulioPage {
  mainForm: FormGroup;
  errorMessage: string;
  verification: any;
  driverLicenseStates: string[];
  driverLicenseState: string;
  identificationTypeControl: any;
  identificationTypes: any[];
  genders: any[];
  identificationType: string;
  @ViewChild(Content) content: Content;

  constructor(
    public nav: NavController,
    public auth: AuthService,
    private ngZone: NgZone
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
      dateOfBirth: new FormControl('', [Validators.required]),
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
      task.verificationArgs.DataFields.NationalIds = [self.verification.NationalId];
    } else if (self.identificationType === 'Passport') {
      task.verificationArgs.DataFields.Passport = self.verification.Passport;
    };


    this.nav.push(IdentityVerificationSummaryPage, { summaryData: task });

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

  showDatePicker() {
    let self = this;
    let mindate = moment(new Date()).subtract(16, 'years');

    DatePicker.show({
      date: new Date(mindate.year(), 0, 1),
      mode: 'date',
      androidTheme: 3,
      maxDate: mindate.valueOf(),
    }).then(
      date => {
        let dateMoment = moment(date);
        self.ngZone.run(() => {
          let control: FormControl = <FormControl>self.mainForm.find('dateOfBirth');
          control.updateValue(dateMoment.format('MM/DD/YYYY'));
        });
        self.verification.PersonInfo.YearOfBirth = dateMoment.year();
        self.verification.PersonInfo.MonthOfBirth = dateMoment.month() + 1;
        self.verification.PersonInfo.DayOfBirth = dateMoment.date();
      });
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
