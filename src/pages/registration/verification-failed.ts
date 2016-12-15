import {Page, NavController} from 'ionic-angular';
import {REACTIVE_FORM_DIRECTIVES} from '@angular/forms';
import {AuthService} from '../../services/auth';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {HomePage} from '../home/home';

@Page({
  templateUrl: 'build/pages/registration/verification-failed.html',
  directives: [REACTIVE_FORM_DIRECTIVES],
  pipes: [TranslatePipe]
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
