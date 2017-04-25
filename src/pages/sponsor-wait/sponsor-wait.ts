import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthService } from '../../services/auth';
import { HomePage } from '../home/home';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

@Component({
  selector: 'page-sponsor-wait',
  templateUrl: 'sponsor-wait.html'
})
export class SponsorWaitPage {
  pageName = 'SponsorWaitPage';
  message: string;

  constructor(public navCtrl: NavController, public auth: AuthService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    this.message = `We are currently waiting for <b>${this.auth.currentUser.sponsor.name}</b> to complete their account before you can get your 2000 UR.</br>Your <b>bonus</b> will be generated soon.`;
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  goToHome() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on Continue button', 'goToHome()');
    this.navCtrl.setRoot(HomePage);
  }

}
