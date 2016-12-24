import {NgZone, Component } from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import {AuthService} from '../../../services/auth';
import {CustomValidator} from '../../../validators/custom';
import {IdentityVerificationSummaryPage} from '../identity-verification-summary/identity-verification-summary';

@Component({
  selector: 'identity-verification-document-page',
  templateUrl: 'identity-verification-document.html',
})
export class IdentityVerificationDocumentPage {
  mainForm: FormGroup;
  verificationArgs: any;
  driverLicenceStates: string[];
  driverLicenceState: string;
  identificationTypeControl: any;
  identificationTypes: any[] = [];
  formElements: any;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    public ngZone: NgZone
  ) {
    this.verificationArgs = this.navParams.get('verificationArgs');

    let allStates: any[] = require('provinces');
    let states = _.filter(allStates, (state) => { return state.country === this.verificationArgs.CountryCode; });
    this.driverLicenceStates = _.map(states, (state) => { return state.name; });

    this.formElements = {};
    let fieldNames = ['identificationType', 'driverLicenceNumber', 'driverLicenceState', 'nationalIdNumber',
      'passportMrz1', 'passportMrz2', 'passportNumber', 'passportExpirationDayOfExpiry',
      'passportExpirationMonthOfExpiry', 'passportExpirationYearOfExpiry'];
    _.each(fieldNames, (fieldName) => {
      this.formElements[fieldName] = new FormControl('', [Validators.required, CustomValidator.nameValidator]);
      (this.formElements[fieldName] as any).name = name;
    });
    this.mainForm = new FormGroup(this.formElements);

  }

  fillIdentificationTypesList() {
    let identificationTypeInfo = this.auth.supportedCountries()[this.verificationArgs.CountryCode].identificationTypes;
    this.identificationTypes = _.map(identificationTypeInfo, (displayName, identificationType) => {
      return { name: displayName, value: identificationType };
    });
    let x = _.find(this.identificationTypes, {value: this.verificationArgs.IdentificationType});
    this.verificationArgs.IdentificationType = (x || this.identificationTypes[0]).value;
    this.clearFormErrors();
    // this.formElements.identificationType.updateValue(this.verificationArgs.IdentificationType);
  }

  nationalIdDisplayName() {
    let typeInfo = _.find(this.identificationTypes, {value: this.verificationArgs.IdentificationType});
    return typeInfo && typeInfo.name;
  }

  submit() {
    this.nav.push(IdentityVerificationSummaryPage, {verificationArgs: this.verificationArgs});
  }

  clearFormErrors() {
    _.each(this.formElements, (control) => {
      control.setErrors(null);
    });
  }

  ionViewDidLoad(){
    this.fillIdentificationTypesList();
  }


}
