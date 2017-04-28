import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { AuthService } from '../../../services/auth';
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
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {

  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
    let Clipboard = require('clipboard');
    new Clipboard('#copy-button');
  }

  signOut() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on sign out button', 'signOut()');
    let alert = this.alertCtrl.create({
      title: "Sign out?",
      buttons: [
        "Cancel"]
    });
    alert.addButton({
      text: "Ok",
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
