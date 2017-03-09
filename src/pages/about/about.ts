import { BuildVersion, BuildDate } from '../../version/version';
import { Component } from '@angular/core';
import { Utils } from '../../services/utils';

@Component({
  selector: 'about-page',
  templateUrl: 'about.html',
})
export class AboutPage {
  public versionNumber: string
  public buildDate: string;

  constructor() {

    this.versionNumber = BuildVersion;
    this.buildDate = BuildDate;
  }

  envModeDisplay() {
    return Utils.envModeDisplay();
  }
}
