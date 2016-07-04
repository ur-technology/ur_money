import {Page, NavController} from 'ionic-angular';
import {HomePage} from '../home/home';

/*
  Generated class for the AboutPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/about/about.html',
})
export class AboutPage {
  constructor(public nav: NavController) { }

  moveBack() {
    this.nav.setRoot(HomePage, {}, { animate: true, direction: 'back' });
  }
}
