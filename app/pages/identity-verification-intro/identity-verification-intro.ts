import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {IdentityVerificationProfilePage} from '../identity-verification-profile/identity-verification-profile';

@Component({
  templateUrl: 'build/pages/identity-verification-intro/identity-verification-intro.html',
  pipes: [TranslatePipe]
})
export class IdentityVerificationIntroPage {

  constructor(private nav: NavController) {

  }

  goToProfile() {
    this.nav.push(IdentityVerificationProfilePage);
  }
}
