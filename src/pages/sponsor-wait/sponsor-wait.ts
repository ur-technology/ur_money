import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthService } from '../../services/auth';
import { HomePage } from '../home/home';
import { TranslateService } from 'ng2-translate';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

@Component({
  selector: 'page-sponsor-wait',
  templateUrl: 'sponsor-wait.html'
})
export class SponsorWaitPage {
  pageName = 'SponsorWaitPage';
  message: string;

  constructor(public navCtrl: NavController, public auth: AuthService, public translate: TranslateService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    this.message = this.translate.instant('identity-verification-sponsor-wait.slideMessage', { value: this.auth.currentUser.sponsor.name });
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  goToHome() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on Continue button', 'goToHome()');
    this.navCtrl.setRoot(HomePage);
  }

}
