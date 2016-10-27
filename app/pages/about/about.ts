import {Page, NavController} from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import { AppVersion } from 'ionic-native';

@Page({
  templateUrl: 'build/pages/about/about.html',
  pipes: [TranslatePipe]
})
export class AboutPage {
  public versionNumber: string;

  constructor(public nav: NavController) {
    let self = this;
    AppVersion.getVersionNumber().then((data) => {
      self.versionNumber = data;
    });
  }
}
