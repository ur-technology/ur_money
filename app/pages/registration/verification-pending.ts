import {Page, NavController} from 'ionic-angular';
import {REACTIVE_FORM_DIRECTIVES} from '@angular/forms';
import {AuthService} from '../../services/auth';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

@Page({
  templateUrl: 'build/pages/registration/verification-pending.html',
  directives: [REACTIVE_FORM_DIRECTIVES],
  pipes: [TranslatePipe]
})
export class VerificationPendingPage {
  constructor(
    public nav: NavController,
    public auth: AuthService
  ) {
  }

}
