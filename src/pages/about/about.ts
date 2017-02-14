import { NavController, Platform } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AuthService } from '../../services/auth';
import { Config } from '../../config/config';
import { BuildVersion, BuildDate } from '../../version/version';
import { Component } from '@angular/core';

@Component({
  selector: 'about-page',
  templateUrl: 'about.html',
})
export class AboutPage {
  public versionNumber: string
  public buildDate: string;

  constructor(public nav: NavController,
    public platform: Platform,
    public auth: AuthService,
    public translateService: TranslateService) {

    this.versionNumber = BuildVersion;
    this.buildDate = BuildDate;
  }

  getTextUrCurrency() {
    return this.translateService.instant(Config.targetPlatform === 'ios' ? 'about.urCurrencyApple' : 'about.urCurrency');
  }
}
