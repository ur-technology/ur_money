import { NavController, AlertController } from 'ionic-angular';
import { HomePage } from '../../home/home';
import { Component } from '@angular/core';
import { Config } from '../../../config/config';
import { ContactsService } from '../../../services/contacts.service';
import { AuthService } from '../../../services/auth';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

@Component({
  selector: 'intro-page',
  templateUrl: 'intro.html',
})
export class IntroPage {
  configPlatform: string;
  pageName = 'IntroPage';

  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    public contactsService: ContactsService,
    public auth: AuthService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    this.configPlatform = Config.targetPlatform;
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  pleaseContinue() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Click on continue button', 'pleaseContinue()');
    this.auth.reloadCurrentUser().then(() => {
      this.contactsService.loadContacts(this.auth.currentUserId, this.auth.currentUser.phone, this.auth.currentUser.countryCode);
      this.nav.setRoot(HomePage);
    });

  }
}
