import {NgZone, Component, ViewChild } from '@angular/core';
import {NavController, NavParams, Content} from 'ionic-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
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
  verificationArgs: any;
  driverLicenceStates: string[];
  driverLicenceState: string;
  identificationTypeControl: any;
  identificationTypes: any[] = [];
  formElements: any;
  @ViewChild(Content) content: Content;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public auth: AuthService,
    private ngZone: NgZone
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
    this.fillIdentificationTypesList();
  }

  fillIdentificationTypesList() {
    _.forIn(this.auth.supportedCountries()[this.verificationArgs.CountryCode].identificationTypes, (displayName, identificationType) => {
      this.identificationTypes.push({ name: displayName, value: identificationType });
    });
    let x = _.find(this.identificationTypes, {value: this.verificationArgs.IdentificationType});
    this.verificationArgs.IdentificationType = (x || this.identificationTypes[0]).value;
    this.clearFormErrors();
    // this.formElements.identificationType.updateValue(this.verificationArgs.IdentificationType);
  }

  submit() {
    this.nav.push(IdentityVerificationSummaryPage, {verificationArgs: this.verificationArgs});
  }

  getNationalIdType() {
    return this.auth.supportedCountries()[this.verificationArgs.CountryCode]['identificationTypes']['NationalId'].type;
  }

  clearFormErrors() {
    _.each(this.formElements, (control) => {
      control.setErrors(null);
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
