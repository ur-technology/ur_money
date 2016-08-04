import {Page, NavController} from 'ionic-angular';
import {HomePage} from '../home/home';
import {Config} from '../../config/config';

@Page({
  templateUrl: 'build/pages/about/about.html',
})
export class AboutPage {
  public config: any;

  constructor(public nav: NavController) {
    this.config = Config;
  }

  moveBack() {
    this.nav.setRoot(HomePage, {}, { animate: true, direction: 'back' });
  }
}
