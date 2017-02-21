import { BuildVersion, BuildDate } from '../../version/version';
import { Component } from '@angular/core';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'about-page',
  templateUrl: 'about.html',
})
export class AboutPage {
  public versionNumber: string
  public buildDate: string;

  constructor(public utilService: UtilService) {

    this.versionNumber = BuildVersion;
    this.buildDate = BuildDate;
  }
}
