import { NavController} from 'ionic-angular';
import {AuthService} from '../../../services/auth';
import {HomePage} from '../../home/home';
import { Component } from '@angular/core';

@Component({
  selector: 'verification-pending-page',
  templateUrl: 'verification-pending.html',
})
export class VerificationPendingPage {
  constructor(
    public nav: NavController,
    public auth: AuthService
  ) {
  }
  goToHome() {
    this.nav.setRoot(HomePage);
  }
}
