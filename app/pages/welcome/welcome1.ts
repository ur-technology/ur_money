import {IonicApp, Page} from 'ionic-angular';
import {Type} from '@angular/core';
import {Welcome2Page} from './welcome2';

@Page({
  templateUrl: 'build/pages/welcome/welcome1.html'
})
export class Welcome1Page  {
  public welcome2Page: Type;

  constructor(public app: IonicApp) {
    this.welcome2Page = Welcome2Page;
  }


}
