import { NavController} from 'ionic-angular';
import {AuthService} from '../../../services/auth';
import {HomePage} from '../../home/home';
import { Component } from '@angular/core';

@Component({
  selector: 'country-not-supported-page',
  templateUrl: 'country-not-supported.html',
})
export class CountryNotSupportedPage {
  constructor(
    public nav: NavController,
    public auth: AuthService
  ) {
  }

  goToHome() {
    this.nav.setRoot(HomePage);
  }
}
