import {IonicApp, Page} from 'ionic-angular';
import {Type} from '@angular/core';
import {Registration2Page} from './registration2';

@Page({
  templateUrl: 'build/pages/registration/registration1.html'
})
export class Registration1Page  {
  public registration2Page: Type;

  constructor(public app: IonicApp) {
    this.registration2Page = Registration2Page;
  }


}
