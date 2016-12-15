import { NavController} from 'ionic-angular';
import {AuthService} from '../../services/auth';
import {HomePage} from '../home/home';
import { Component } from '@angular/core';

@Component({
  selector: 'verification-failed-page',
  templateUrl: 'verification-failed.html',
})
export class VerificationFailedPage {
  constructor(
    public nav: NavController,
    public auth: AuthService
  ) {
  }

  goToHome() {
    this.nav.setRoot(HomePage);
  }

}
