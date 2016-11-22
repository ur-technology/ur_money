import {Page, NavController, Platform} from 'ionic-angular';
import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';
import {AppVersion} from 'ionic-native';
import {AuthService} from '../../services/auth';

@Page({
  templateUrl: 'build/pages/about/about.html',
  pipes: [TranslatePipe]
})
export class AboutPage {
  public versionNumber: string;

  constructor(public nav: NavController, private platform: Platform, private auth: AuthService, private translateService: TranslateService) {
    let self = this;
    if (this.platform.is('cordova')) {
      AppVersion.getVersionNumber().then((data) => {
        self.versionNumber = data;
      });
    }
  }

  getTextUrCurrency() {
    return this.platform.is('ios') ? this.translateService.instant('about.urCurrencyApple') : this.translateService.instant('about.urCurrency');
  }
}
