import {Page, NavController, Platform} from 'ionic-angular';
import {Type} from '@angular/core';
import {PhoneNumberPage} from './phone-number';
import {DownloadPage} from '../download/download';

@Page({
  templateUrl: 'build/pages/registration/welcome.html'
})
export class WelcomePage {
  public phoneNumberPage: Type;

  constructor(public nav: NavController, private platform: Platform) {
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

}
