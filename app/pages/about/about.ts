import {Page, NavController} from 'ionic-angular';
import {HomePage} from '../home/home';
import {Config} from '../../config/config';
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";

@Page({
  templateUrl: 'build/pages/about/about.html',
  pipes: [TranslatePipe]
})
export class AboutPage {
  public config: any;

  constructor(public nav: NavController) {
    this.config = Config;
  }
}
