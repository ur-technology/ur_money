import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, AlertController, ToastController } from 'ionic-angular';
import * as _ from 'lodash';
import * as log from 'loglevel';
import { CustomValidator } from '../../../validators/custom';
import { AuthService } from '../../../services/auth';
import { HomePage } from '../home/home';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Config } from '../../../config/config';
import {AboutPage} from '../../about/about';
import {SettingsAccountPage} from '../settings-account/settings-account';
import {SettingsNotificationsPage} from '../settings-notifications/settings-notifications';

@Component({
  templateUrl: 'settings.html',
})
export class SettingsPage {
  public mainForm: FormGroup;
  targetPlatform = Config.targetPlatform;

  constructor(
    public nav: NavController,
    public auth: AuthService,
    public alertCtrl: AlertController,
    public translate: TranslateService
  ) {

  }

  ionViewDidEnter() {
    let Clipboard = require('clipboard');
    new Clipboard('#copy-button');
  }

  signOut() {
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
    this.nav.push(AboutPage);
  }

  gotoSettingAccount() {
    this.nav.push(SettingsAccountPage);
  }

  gotoSettingsNotifications() {
    this.nav.push(SettingsNotificationsPage);
  }

}
