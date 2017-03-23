import { NavController, Platform, AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { ContactsAndChatsPage } from '../../pages/contacts-and-chats/contacts-and-chats';
import { Component } from '@angular/core';
import { SendPage } from './../send/send';
import { AuthService } from '../../services/auth';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Config } from '../../config/config';
import { InviteLinkPage } from '../../pages/invite-link/invite-link';

@Component({
  selector: 'transactions-page',
  templateUrl: 'transactions.html',
})
export class TransactionsPage {
  segmentSelected: any = 'all';

  constructor(public nav: NavController, public platform: Platform, private auth: AuthService, private alertCtrl: AlertController, private translate: TranslateService) {
  }

  goToPage(page: string) {
    switch (page) {
      case 'home':
        this.nav.setRoot(HomePage);
        break;
      case 'send':
        this.nav.push(SendPage);
        break;
    }

  }

  invite() {
    if (!this.auth.announcementConfirmed()) {
      let alert = this.alertCtrl.create({
        subTitle: this.translate.instant('home.noInvitesAllowed'),
        buttons: [this.translate.instant('dismiss')]
      });
      alert.present();
    } else {
      if (Config.targetPlatform === 'web') {
        this.nav.push(InviteLinkPage);
      } else {
        this.nav.push(ContactsAndChatsPage, { goal: 'invite' });
      }
    }
  }


}
