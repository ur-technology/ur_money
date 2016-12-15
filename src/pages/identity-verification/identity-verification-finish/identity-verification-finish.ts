import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {HomePage} from '../../home/home';
import {AuthService} from '../../../services/auth';

@Component({
  selector: 'identity-verification-finish-page',
  templateUrl: 'identity-verification-finish.html',
})
export class IdentityVerificationFinishPage {

  constructor(public navCtrl: NavController, public auth: AuthService) {

  }

  goToHome() {
    this.navCtrl.setRoot(HomePage);
  }
}
