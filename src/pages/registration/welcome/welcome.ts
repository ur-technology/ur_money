import { NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { SignUpPage } from '../sign-up/sign-up';
import { SignInPage } from '../sign-in/sign-in';
import { Utils } from '../../../services/utils';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

@Component({
  selector: 'welcome-page',
  templateUrl: 'welcome.html',
})
export class WelcomePage {
  pageName = 'WelcomePage';

  constructor(public nav: NavController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
  }

  signUp() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked sign up button', 'signUp()');
    this.nav.push(SignUpPage);
  }

  signIn() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked sign in button', 'signIn()');
    this.nav.push(SignInPage);
  }

  envModeDisplay() {
    return Utils.envModeDisplay();
  }

}
