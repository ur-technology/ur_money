import { NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { SignUpPage } from '../sign-up/sign-up';
import { SignInPage } from '../sign-in/sign-in';
import { Utils } from '../../../services/utils';

@Component({
  selector: 'welcome-page',
  templateUrl: 'welcome.html',
})
export class WelcomePage {

  constructor(public nav: NavController) {
  }

  signUp() {
    this.nav.push(SignUpPage);
  }

  signIn() {
    this.nav.push(SignInPage);
  }

  envModeDisplay() {
    return Utils.envModeDisplay();
  }

}
