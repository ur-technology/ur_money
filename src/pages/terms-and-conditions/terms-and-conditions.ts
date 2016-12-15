import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';

@Component({
  templateUrl: 'terms-and-conditions.html',
})
export class TermsAndConditionsPage {

  constructor(public navCtrl: NavController, public viewCtrl: ViewController) {
  }

  closePage() {
    this.viewCtrl.dismiss();
  }
}
