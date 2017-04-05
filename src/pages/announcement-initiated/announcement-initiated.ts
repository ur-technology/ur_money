import { NavController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { Component } from '@angular/core';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

@Component({
  selector: 'announcement-initiated-page',
  templateUrl: 'announcement-initiated.html'
})
export class AnnouncementInitiatedPage {
  pageName = 'AnnouncementInitiatedPage';

  constructor(public nav: NavController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  goToHome() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on go to home button', 'goToHome()');
    this.nav.setRoot(HomePage);
  }
}
