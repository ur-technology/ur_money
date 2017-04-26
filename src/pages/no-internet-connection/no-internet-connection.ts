import { Component } from '@angular/core';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

@Component({
  selector: 'no-internet-connection-page',
  templateUrl: 'no-internet-connection.html',
})
export class NoInternetConnectionPage {
  pageName = 'NoInternetConnectionPage';

  constructor(
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  reload() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Click on Reload button', 'reload()');
    window.location.reload();
  }
}
