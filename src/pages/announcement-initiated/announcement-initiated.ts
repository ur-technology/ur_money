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

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
  }

  goToHome() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on go to home button', 'goToHome()');
    this.nav.setRoot(HomePage);
  }
}
