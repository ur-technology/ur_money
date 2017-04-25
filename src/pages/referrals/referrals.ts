import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';
import * as _ from 'lodash';
import { ChatPage } from '../../pages/chat/chat';
import { CountryListService } from '../../services/country-list';

@Component({
  selector: 'page-referrals',
  templateUrl: 'referrals.html',
})
export class ReferralsPage {
  pageName = 'ReferralsPage';
  referrals = [];
  filteredReferrals = [];
  showSpinner = false;
  userToLookForReferrals: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private userService: UserService, private auth: AuthService, private googleAnalyticsEventsService: GoogleAnalyticsEventsService, private countryListService: CountryListService) {
    this.userToLookForReferrals = this.navParams.get('userToLookForReferrals');
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
    this.loadReferrals();
  }

  getPageTitle(): string {
    if (!this.userToLookForReferrals || (this.userToLookForReferrals === this.auth.currentUser.key)) {
      return `My referrals`;
    } else {
      return `${this.navParams.get('userToLookName')}'s referrals`;
    }
  }

  loadReferrals() {
    let self = this;
    self.showSpinner = true;
    self.userService.getReferrals(this.auth.currentUser.key, this.userToLookForReferrals ? this.userToLookForReferrals : this.auth.currentUser.key).then(referrals => {
      self.referrals = _.values(referrals);
      self.filteredReferrals = _.values(referrals);
      self.showSpinner = false;
    });
  }

  openSelectedUserReferrals(referral) {
    this.navCtrl.push(ReferralsPage, { userToLookForReferrals: referral.userId, userToLookName: referral.name })
  }

  chatWith(contact, event) {
    event.stopPropagation();
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

  country(code) {
    return this.countryListService.findCountryByCode(code);
  }

}
