import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {HomePage} from '../../home/home';
import {AuthService} from '../../../services/auth';
import {ChatPage} from '../../chat/chat';
import {TranslateService} from 'ng2-translate';

@Component({
  selector: 'identity-verification-sponsor-wait-page',
  templateUrl: 'identity-verification-sponsor-wait.html',
})
export class IdentityVerificationSponsorWaitPage {
  public param:any = {};
  public mensaje = "";
  public buttonValue = "";


  constructor(public navCtrl: NavController, public auth: AuthService, public translate: TranslateService) {
    this.param.sponsor = this.auth.currentUser.sponsor.name;
    this.mensaje = this.translate.instant('identity-verification-sponsor-wait.slideMessage', this.param);
    this.buttonValue = this.translate.instant('identity-verification-sponsor-wait.sendMessage', this.param);
  }

  goToHome() {
    this.navCtrl.setRoot(HomePage);
  }

  sendMessageSponsor() {
    this.navCtrl.popToRoot({ animate: false, duration: 0, progressAnimation: false }).then(data => {
      this.navCtrl.push(ChatPage, { contact: this.auth.currentUser.sponsor });
    });
  }
}
