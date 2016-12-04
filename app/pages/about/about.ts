import {Page, NavController, Platform} from 'ionic-angular';
import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';
// import {AppVersion} from 'ionic-native';
import {AuthService} from '../../services/auth';
import {Config} from '../../config/config';

@Page({
  templateUrl: 'build/pages/about/about.html',
  pipes: [TranslatePipe]
})
export class AboutPage {
  public versionNumber: string;

  constructor(public nav: NavController, private platform: Platform, private auth: AuthService, private translateService: TranslateService) {
    this.versionNumber = Config.versionNumber;
    // if (this.platform.is('cordova')) {
    //   let self = this;
    //   AppVersion.getVersionNumber().then((data) => {
    //     self.versionNumber = data;
    //   });
    // }
  }

  getTextUrCurrency() {
    return this.translateService.instant(Config.targetPlatform === 'ios' ? 'about.urCurrencyApple' : 'about.urCurrency');
  }
}
