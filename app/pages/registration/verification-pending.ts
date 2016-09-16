import {ViewChild, ElementRef, Inject} from '@angular/core';
import {Page, NavController, Platform, AlertController, ToastController} from 'ionic-angular';
import {REACTIVE_FORM_DIRECTIVES, FormGroup, FormControl, Validators} from '@angular/forms';
import {AngularFire} from 'angularfire2'
import * as _ from 'lodash';
import * as log from 'loglevel';

import {FocuserDirective} from '../../directives/focuser';
import {WalletModel} from '../../models/wallet';
import {AuthService} from '../../services/auth';
import {DeviceIdentityService} from '../../services/device-identity';
import {CustomValidator} from '../../validators/custom';
import {LoadingModalComponent} from '../../components/loading-modal/loading-modal';
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";

@Page({
  templateUrl: 'build/pages/registration/verification-pending.html',
  directives: [REACTIVE_FORM_DIRECTIVES, FocuserDirective],
  pipes: [TranslatePipe]
})
export class VerificationPendingPage {
  constructor(
    public nav: NavController,
    public auth: AuthService
  ) {
  }

}
