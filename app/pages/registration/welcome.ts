import {Page, NavController, Platform, ModalController } from 'ionic-angular';
import {Type} from '@angular/core';
import {PhoneNumberPage} from './phone-number';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {TermsAndConditionsPage} from '../terms-and-conditions/terms-and-conditions';
import {AuthService} from '../../services/auth';

@Page({
  templateUrl: 'build/pages/registration/welcome.html',
  pipes: [TranslatePipe]
})
export class WelcomePage {
  public phoneNumberPage: Type;

  constructor(public nav: NavController, private platform: Platform, private modalCtrl: ModalController,
    public auth: AuthService) {
    this.phoneNumberPage = PhoneNumberPage;
  }

  goToPage(page) {
    this.nav.setRoot(page, {}, { animate: true, direction: 'forword' });
  }

  openTermsAndConditions() {
    let modal = this.modalCtrl.create(TermsAndConditionsPage);
    modal.present();
  }

}
