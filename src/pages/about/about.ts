import { NavController, Platform} from 'ionic-angular';
import { TranslateService} from 'ng2-translate/ng2-translate';
import {AuthService} from '../../services/auth';
import {Config} from '../../config/config';
import { Component } from '@angular/core';

@Component({
  selector: 'about-page',
  templateUrl: 'about.html',
})
export class AboutPage {
  public versionNumber: string;

  constructor(public nav: NavController, public platform: Platform, public auth: AuthService, public translateService: TranslateService) {
    this.versionNumber = Config.versionNumber;
  }

  getTextUrCurrency() {
    return this.translateService.instant(Config.targetPlatform === 'ios' ? 'about.urCurrencyApple' : 'about.urCurrency');
  }
}
