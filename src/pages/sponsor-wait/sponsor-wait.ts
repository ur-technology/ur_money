import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {AuthService} from '../../services/auth';
import {HomePage} from '../home/home';
import {TranslateService} from 'ng2-translate';

@Component({
  selector: 'page-sponsor-wait',
  templateUrl: 'sponsor-wait.html'
})
export class SponsorWaitPage {

  message: string;

  constructor(public navCtrl: NavController, public auth: AuthService, public translate: TranslateService) {
    this.message = this.translate.instant('identity-verification-sponsor-wait.slideMessage', { value: this.auth.currentUser.sponsor.name });
  }

  ionViewDidLoad() {
  }

  goToHome() {
    this.navCtrl.setRoot(HomePage);
  }

}
