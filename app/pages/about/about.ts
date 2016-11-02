import {Page, NavController, Platform} from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {AppVersion} from 'ionic-native';
import {AuthService} from '../../services/auth';

@Page({
  templateUrl: 'build/pages/about/about.html',
  pipes: [TranslatePipe]
})
export class AboutPage {
  public versionNumber: string;

  constructor(public nav: NavController, private platform: Platform, private auth: AuthService) {
    let self = this;
    if (this.platform.is('cordova')) {
      AppVersion.getVersionNumber().then((data) => {
        self.versionNumber = data;
      });
    }
  }

}
