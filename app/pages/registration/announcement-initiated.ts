import {Page, NavController} from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {HomePage} from '../home/home';

@Page({
  templateUrl: 'build/pages/registration/announcement-initiated.html',
  pipes: [TranslatePipe]
})
export class AnnouncementInitiatedPage {
  constructor(public nav: NavController) {
  }

  goToHome() {
    this.nav.setRoot(HomePage);
  }
}
