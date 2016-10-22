import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";

@Component({
  templateUrl: 'build/pages/terms-and-conditions/terms-and-conditions.html',
  pipes: [TranslatePipe]
})
export class TermsAndConditionsPage {

  constructor(private navCtrl: NavController, public viewCtrl: ViewController) {
  }

  closePage() {
    this.viewCtrl.dismiss();
  }
}
