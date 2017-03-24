import { NavController, AlertController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from 'ng2-translate/ng2-translate';
import * as _ from 'lodash';
import * as log from 'loglevel';
import * as firebase from 'firebase';
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
    public auth: AuthService,
    private translate: TranslateService,
    public alertCtrl: AlertController
  ) {
    let formElements: any = {
      name: new FormControl('', [CustomValidator.nameValidator, Validators.required]),
      email: new FormControl(this.auth.currentUser.email, [Validators.required, CustomValidator.emailValidator])
    };
    this.mainForm = new FormGroup(formElements);

  }

  ionViewDidLoad() {
    let self = this;
    self.auth.reloadCurrentUser().then(() => {
      let name = _.isEmpty(_.trim(self.auth.currentUser.name || '')) ? `${self.auth.currentUser.firstName || ''} ${self.auth.currentUser.lastName || ''}` : self.auth.currentUser.name;
      (<FormControl>self.mainForm.controls['name']).setValue(name);
    });
  }

  showRealNameExplanation() {
    let alert = this.alertCtrl.create({
      message: this.translate.instant('profile-setup.realNameExplanation'),
      buttons: [{
        text: this.translate.instant('ok'),
        handler: () => {
          alert.dismiss();
        }
      }
      ]
    });
    alert.present();
  }

  submit() {
    this.auth.currentUser.update(this.mainForm.value).then(() => {

      firebase.database().ref('/manualIDVerification/tasks').push({
        id: this.auth.currentUserId
      }).then();

      this.nav.push(WalletSetupPage);
    }).catch((error) => {
      log.warn('unable to save profile info');
    });
  };
}
