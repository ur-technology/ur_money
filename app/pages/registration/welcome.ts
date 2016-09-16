import {Page, NavController, Platform} from 'ionic-angular';
import {Type} from '@angular/core';
import {PhoneNumberPage} from './phone-number';
import {DownloadPage} from '../download/download';
import {TranslatePipe} from "ng2-translate/ng2-translate";

@Page({
  templateUrl: 'build/pages/registration/welcome.html',
  pipes: [TranslatePipe]
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
