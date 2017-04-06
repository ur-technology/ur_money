import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../../services/auth';
import { GoogleAnalyticsEventsService } from '../../../services/google-analytics-events.service';
import * as _ from 'lodash';

@Component({
  selector: 'page-settings-notifications',
  templateUrl: 'settings-notifications.html'
})
export class SettingsNotificationsPage {
  chatNotificationsEnabled: boolean = false;
  transactionNotificationsEnabled: boolean = false;
  pageName = 'SettingsNotificationsPage';

  constructor(public navCtrl: NavController, public navParams: NavParams, public auth: AuthService,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    this.chatNotificationsEnabled = this.auth.currentUser.notifications && this.auth.currentUser.notifications.chatNotificationsEnabled;
    this.chatNotificationsEnabled = _.isUndefined(this.chatNotificationsEnabled) ? true : this.chatNotificationsEnabled;
    this.transactionNotificationsEnabled = this.auth.currentUser.notifications && this.auth.currentUser.notifications.transactionNotificationsEnabled;
    this.transactionNotificationsEnabled = _.isUndefined(this.transactionNotificationsEnabled) ? true : this.transactionNotificationsEnabled;
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  changeChatNotification(value) {
    this.auth.currentUser.updateNotifications({ chatNotificationsEnabled: value.checked });
  }

  changeTransactionNotification(value) {
    this.auth.currentUser.updateNotifications({ transactionNotificationsEnabled: value.checked });
  }

}
