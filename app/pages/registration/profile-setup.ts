import {Page, NavController} from 'ionic-angular';
import {REACTIVE_FORM_DIRECTIVES, FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {UserModel} from '../../models/user';
import {AuthService} from '../../services/auth';
import {CustomValidator} from '../../validators/custom';
import {WalletSetupPage} from '../../pages/registration/wallet-setup';
import {KeyboardAttachDirective} from '../../directives/keyboard-attach.directive';

@Page({
  templateUrl: 'build/pages/registration/profile-setup.html',
  directives: [REACTIVE_FORM_DIRECTIVES, KeyboardAttachDirective],
  pipes: [TranslatePipe]
})
export class ProfileSetupPage {
  mainForm: FormGroup;
  errorMessage: string;
  countries: any[];
  profile: any;
  constructor(
    public nav: NavController,
    public auth: AuthService
  ) {

    this.profile = _.pick(this.auth.currentUser, ['firstName', 'lastName', 'countryCode', 'email']);
    this.profile.countryCode = 'US';

    let formElements: any = {
      firstName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      lastName: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      country: new FormControl(this.profile.countryCode, Validators.required),
      email: new FormControl('', [Validators.required, CustomValidator.emailValidator])
    };
    this.mainForm = new FormGroup(formElements);
    this.fillCountriesArray();
  }

  fillCountriesArray() {
    this.countries = require('country-data').countries.all.sort((a, b) => {
      return (a.name < b.name) ? -1 : ((a.name === b.name) ? 0 : 1);
    });
    // remove Cuba, Iran, North Korea, Sudan, Syria
    this.countries = _.filter(this.countries, (country) => {
      return ['CU', 'IR', 'KP', 'SD', 'SY'].indexOf(country.alpha2) === -1;
    });
  }

  submit() {
    let newValues = _.merge(this.profile, {
      name: UserModel.fullName(this.profile)
    });
    this.auth.currentUserRef.update(newValues).then(() => {
      _.merge(this.auth.currentUser, newValues);
      this.nav.setRoot(WalletSetupPage);
    }).catch((error) => {
      log.warn('unable to save address info');
    });
  };
}
