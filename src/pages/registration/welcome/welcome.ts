import { NavController, Platform, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { SignUpPage } from '../sign-up/sign-up';
import { SignInPage } from '../sign-in/sign-in';
import { AuthService } from '../../../services/auth';

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
    this.nav.push(SignInPage);
  }

}
