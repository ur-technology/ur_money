import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

@Component({
  templateUrl: 'terms-and-conditions.html',
})
export class TermsAndConditionsPage {
  pageName = 'TermsAndConditionsPage';

  constructor(public navCtrl: NavController, public viewCtrl: ViewController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  closePage() {
    this.viewCtrl.dismiss();
  }
}
