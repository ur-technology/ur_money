import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';
import * as _ from 'lodash';
import { ChatPage } from '../../pages/chat/chat';

@Component({
  selector: 'page-referrals',
  templateUrl: 'referrals.html',
})
export class ReferralsPage {
  pageName = 'ReferralsPage';
  referrals = [];
  filteredReferrals = [];
  showSpinner = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private userService: UserService, private auth: AuthService, private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
    this.loadReferrals();
  }

  loadReferrals() {
    let self = this;
    self.showSpinner = true;
    self.userService.getReferrals(this.auth.currentUser.key).then(referrals => {
      self.referrals = _.values(referrals);
      self.filteredReferrals = _.values(referrals);
      self.showSpinner = false;
    })
  }

  chatWith(contact) {
    let self = this;
    self.navCtrl.push(ChatPage, { contact: contact });
  }

  filterItems(ev) {
    let val = ev.target.value;
    this.filteredReferrals = this.referrals;
    if (val && val.trim() !== '') {
      this.filteredReferrals = _.filter(this.filteredReferrals, contact => {
        if (contact.name) {
          return contact.name.toLowerCase().indexOf(val.toLowerCase()) !== -1;
        }
      });
    }
  }

}
