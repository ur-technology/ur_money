import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {HomePage} from '../../home/home';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {AuthService} from '../../../services/auth';

@Component({
  templateUrl: 'build/pages/identity-verification/identity-verification-finish/identity-verification-finish.html',
  pipes: [TranslatePipe]
})
export class IdentityVerificationFinishPage {

  constructor(private navCtrl: NavController, public auth: AuthService) {

  }

  goToHome() {
    this.auth.reloadCurrentUser();
    this.navCtrl.setRoot(HomePage);
  }
}
