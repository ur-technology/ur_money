import { NavController, AlertController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {AuthService} from '../../services/auth';
import {ProfileSetupPage} from './profile-setup';
import { Component } from '@angular/core';

@Component({
  templateUrl: 'intro.html',
})
export class IntroPage {

  constructor(
    public nav: NavController,
    public auth: AuthService,
    public alertCtrl: AlertController,
    public translate: TranslateService
  ) {
  }

  notNow() {
    let alert = this.alertCtrl.create({
      title: this.translate.instant('intro.notReadyTitle'),
      message: this.translate.instant('intro.notReadyMessage'),
      buttons: [
        {
          text: this.translate.instant('cancel'), handler: () => {
            alert.dismiss();
          }
        },
        {
          text: this.translate.instant('intro.yesSignOut'), handler: () => {
            alert.dismiss().then(() => {
              this.auth.angularFire.auth.logout();
            });
          }
        }
      ]
    });
    alert.present();
  }

  pleaseContinue() {
    this.nav.setRoot(ProfileSetupPage);
  }
}
