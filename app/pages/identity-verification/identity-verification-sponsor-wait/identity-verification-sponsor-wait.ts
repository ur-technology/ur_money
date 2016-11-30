import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {HomePage} from '../../home/home';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {AuthService} from '../../../services/auth';

@Component({
  templateUrl: 'build/pages/identity-verification/identity-verification-sponsor-wait/identity-verification-sponsor-wait.html',
  pipes: [TranslatePipe]
})
export class IdentityVerificationSponsorWaitPage {
  param: any = {};

  constructor(private navCtrl: NavController, public auth: AuthService) {
    this.param.sponsor = this.auth.currentUser.sponsor.name;
  }

  goToHome() {
    this.navCtrl.setRoot(HomePage);
  }
}
