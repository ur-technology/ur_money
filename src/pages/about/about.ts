import { BuildVersion, BuildDate } from '../../version/version';
import { Component } from '@angular/core';
import { Utils } from '../../services/utils';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

@Component({
  selector: 'about-page',
  templateUrl: 'about.html',
})
export class AboutPage {
  public versionNumber: string
  public buildDate: string;
  pageName = 'AboutPage';

  constructor(private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    this.versionNumber = BuildVersion;
    this.buildDate = BuildDate;
  }

  envModeDisplay() {
    return Utils.envModeDisplay();
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }
}
