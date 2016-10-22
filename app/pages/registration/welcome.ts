import {Page, NavController, Platform, ModalController } from 'ionic-angular';
import {Type} from '@angular/core';
import {PhoneNumberPage} from './phone-number';
import {DownloadPage} from '../download/download';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {TermsAndConditionsPage} from '../terms-and-conditions/terms-and-conditions';

@Page({
  templateUrl: 'build/pages/registration/welcome.html',
  pipes: [TranslatePipe]
})
export class WelcomePage {
  public phoneNumberPage: Type;

  constructor(public nav: NavController, private platform: Platform, private modalCtrl: ModalController) {
    this.phoneNumberPage = PhoneNumberPage;
  }

  goToPage(page) {
    this.nav.setRoot(page, {}, { animate: true, direction: 'forword' });
  }

  goToDownloadPage() {
    if (!this.platform.is('cordova')) {
      this.nav.setRoot(DownloadPage, {}, { animate: true, direction: 'forword' });
    }
  }

  openTermsAndConditions() {
    let modal = this.modalCtrl.create(TermsAndConditionsPage);
    modal.present();
  }

}
