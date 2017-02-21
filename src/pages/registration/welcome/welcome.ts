import { NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { SignUpPage } from '../sign-up/sign-up';
import { SignInPage } from '../sign-in/sign-in';
import { UtilService } from '../../../services/util.service';

@Component({
  selector: 'welcome-page',
  templateUrl: 'welcome.html',
})
export class WelcomePage {

  constructor(public nav: NavController, private utilService: UtilService) {
  }

  signUp() {
    this.nav.push(SignUpPage);
  }

  signIn() {
    this.nav.push(SignInPage);
  }

}
