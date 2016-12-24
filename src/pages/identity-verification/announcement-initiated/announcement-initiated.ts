import { NavController} from 'ionic-angular';
import {HomePage} from '../../home/home';
import { Component } from '@angular/core';

@Component({
  selector: 'announcement-initiated-page',
  templateUrl: 'announcement-initiated.html'
})
export class AnnouncementInitiatedPage {
  constructor(public nav: NavController) {
  }

  goToHome() {
    this.nav.setRoot(HomePage);
  }
}
