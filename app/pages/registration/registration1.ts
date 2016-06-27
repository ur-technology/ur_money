import {Page, NavController} from 'ionic-angular';
import {Type} from '@angular/core';
import {Registration2Page} from './registration2';

@Page({
  templateUrl: 'build/pages/registration/registration1.html'
})
export class Registration1Page {
  public registration2Page: Type;

  constructor(public nav: NavController) {
    this.registration2Page = Registration2Page;
  }
  goToPage(page) {
    this.nav.setRoot(page, {}, { animate: true, direction: 'forword' });
  }

}
