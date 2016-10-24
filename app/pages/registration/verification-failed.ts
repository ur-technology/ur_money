import {Page, NavController} from 'ionic-angular';
import {REACTIVE_FORM_DIRECTIVES} from '@angular/forms';
import {FocuserDirective} from '../../directives/focuser';
import {AuthService} from '../../services/auth';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

@Page({
  templateUrl: 'build/pages/registration/verification-failed.html',
  directives: [REACTIVE_FORM_DIRECTIVES, FocuserDirective],
  pipes: [TranslatePipe]
})
export class VerificationFailedPage {
  constructor(
    public nav: NavController,
    public auth: AuthService
  ) {
  }

}
