import { NavController, Platform, ModalController } from 'ionic-angular';
import {PhoneNumberPage} from '../phone-number/phone-number';
import {AuthService} from '../../../services/auth';
import { Component } from '@angular/core';
import {SignUpPage} from '../sign-up/sign-up';

@Component({
  selector: 'welcome-page',
  templateUrl: 'welcome.html',
})
export class WelcomePage {

  constructor(public nav: NavController, public platform: Platform, public modalCtrl: ModalController,
    public auth: AuthService) {
  }

  signUp() {
    this.nav.push(SignUpPage);
  }

  signIn() {
    this.nav.push(PhoneNumberPage);
  }

}
