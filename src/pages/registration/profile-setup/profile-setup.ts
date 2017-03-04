import { NavController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
import * as log from 'loglevel';
import { AuthService } from '../../../services/auth';
import { CustomValidator } from '../../../validators/custom';
import { WalletSetupPage } from '../../../pages/registration/wallet-setup/wallet-setup';
import { Component } from '@angular/core';

@Component({
  selector: 'profile-setup-page',
  templateUrl: 'profile-setup.html',
})
export class ProfileSetupPage {
  mainForm: FormGroup;
  errorMessage: string;
  constructor(
    public nav: NavController,
    public auth: AuthService
  ) {

    let name = _.isEmpty(_.trim(this.auth.currentUser.name || '')) ? `${this.auth.currentUser.firstName || ''} ${this.auth.currentUser.lastName || ''}` : this.auth.currentUser.name;

    let formElements: any = {
      name: new FormControl(name, [CustomValidator.nameValidator, Validators.required]),
      email: new FormControl(this.auth.currentUser.email, [Validators.required, CustomValidator.emailValidator])
    };
    this.mainForm = new FormGroup(formElements);
  }


  submit() {
    this.auth.currentUser.update(this.mainForm.value).then(() => {
      this.nav.push(WalletSetupPage);
    }).catch((error) => {
      log.warn('unable to save profile info');
    });
  };
}
