import {Page, NavController, AlertController} from 'ionic-angular';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {AuthService} from '../../services/auth';
import {ProfileSetupPage} from './profile-setup';

@Page({
  templateUrl: 'build/pages/registration/intro.html',
  pipes: [TranslatePipe]
})
export class IntroPage {

  constructor(
    public nav: NavController,
    public auth: AuthService,
    private alertCtrl: AlertController,
    private translate: TranslateService
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
