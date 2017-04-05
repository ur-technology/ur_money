import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { AuthService } from '../../../services/auth';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Config } from '../../../config/config';
import {AboutPage} from '../../about/about';
import {SettingsAccountPage} from '../settings-account/settings-account';
import {SettingsNotificationsPage} from '../settings-notifications/settings-notifications';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';

@Component({
  templateUrl: 'settings.html',
})
export class SettingsPage {
  pageName = 'SettingsPage';
  targetPlatform = Config.targetPlatform;

  constructor(
    public nav: NavController,
    public auth: AuthService,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {

  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
    let Clipboard = require('clipboard');
    new Clipboard('#copy-button');
  }

  signOut() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on sign out button', 'signOut()');
    let alert = this.alertCtrl.create({
      title: this.translate.instant('signOut') + '?',
      buttons: [
        this.translate.instant('cancel')]
    });
    alert.addButton({
      text: this.translate.instant('ok'),
      handler: () => {
        this.auth.angularFire.auth.logout();
      }
    });
    alert.present();
  }

  gotoAbout() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on about button', 'gotoAbout()');
    this.nav.push(AboutPage);
  }

  gotoSettingAccount() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on settings account button', 'gotoSettingAccount()');
    this.nav.push(SettingsAccountPage);
  }

  gotoSettingsNotifications() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on settings notification button', 'gotoSettingsNotifications()');
    this.nav.push(SettingsNotificationsPage);
  }

}
