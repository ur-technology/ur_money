import {Page, NavController, Platform} from 'ionic-angular';
import {Type} from '@angular/core';
import {Registration2Page} from './registration2';
import {DownloadPage} from '../download/download';

@Page({
  templateUrl: 'build/pages/registration/registration1.html'
})
export class Registration1Page {
  public registration2Page: Type;

  constructor(public nav: NavController, private platform: Platform) {
    this.registration2Page = Registration2Page;
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
