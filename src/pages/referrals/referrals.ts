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
  showSpinner = false;
  userToLookForReferrals: string;
  searchBy: string = 'name';
  showOptions: boolean = false;
  endOfResults: boolean = false;
  startAt = 0;
  numOfItemsToReturn = 550;

  constructor(public navCtrl: NavController, public navParams: NavParams, private userService: UserService, private auth: AuthService, private googleAnalyticsEventsService: GoogleAnalyticsEventsService, private countryListService: CountryListService) {
    this.userToLookForReferrals = this.navParams.get('userToLookForReferrals');
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
    this.loadReferrals();
  }

  onSearchBarFocus() {
    this.showOptions = true;
    return this.showOptions;
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
    self.userService.getReferrals(this.auth.currentUser.key, this.userToLookForReferrals ? this.userToLookForReferrals : this.auth.currentUser.key, this.startAt, this.numOfItemsToReturn).then((result: any) => {
      self.referrals = self.referrals.concat(_.values(result.referrals));
      self.endOfResults = result.endOfResults;
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
    // let val = ev.target.value;

  }

  country(code) {
    let country = this.countryListService.findCountryByCode(code);
    if (country !== 'None') {
      return country;
    }
  }

  loadMore() {
    this.startAt += this.numOfItemsToReturn;
    this.loadReferrals();
  }

}
