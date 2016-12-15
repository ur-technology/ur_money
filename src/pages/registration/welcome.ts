import { NavController, Platform, ModalController } from 'ionic-angular';
import {PhoneNumberPage} from './phone-number';
import {TermsAndConditionsPage} from '../terms-and-conditions/terms-and-conditions';
import {AuthService} from '../../services/auth';
import { Component } from '@angular/core';

@Component({
  templateUrl: 'welcome.html',
})
export class WelcomePage {

  constructor(public nav: NavController, public platform: Platform, public modalCtrl: ModalController,
    public auth: AuthService) {
  }

  goToPage() {
    this.nav.setRoot(PhoneNumberPage, {}, { animate: true, direction: 'forword' });
  }

  openTermsAndConditions() {
    let modal = this.modalCtrl.create(TermsAndConditionsPage);
    modal.present();
  }

}
