import { NavController, Platform, AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { ContactsAndChatsPage } from '../../pages/contacts-and-chats/contacts-and-chats';
import { Component } from '@angular/core';
import { SendPage } from './../send/send';
import { AuthService } from '../../services/auth';
import { Config } from '../../config/config';
import { InviteLinkPage } from '../../pages/invite-link/invite-link';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

@Component({
  selector: 'transactions-page',
  templateUrl: 'transactions.html',
})
export class TransactionsPage {
  segmentSelected: any = 'all';
  pageName = 'TransactionsPage';

  constructor(public nav: NavController, public platform: Platform, private auth: AuthService, private alertCtrl: AlertController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
  }

  ionViewDidEnter() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
  }

  goToPage(page: string) {
    switch (page) {
      case 'home':
        this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on home footer button', 'goToPage()');
        this.nav.setRoot(HomePage);
        break;
      case 'send':
        this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on send footer button', 'goToPage()');
        this.nav.push(SendPage);
        break;
    }

  }

  invite() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on invite button', 'invite()');
    if (!this.auth.announcementConfirmed()) {
      this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Bonus is not approved yet', 'invite()');
      let alert = this.alertCtrl.create({
        subTitle: "Please wait until your bonus is confirmed to invite friends",
        buttons: ["Dismiss"]
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
