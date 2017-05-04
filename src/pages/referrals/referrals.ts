import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth';
import { UserModel } from '../../models/user.model';
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
  endOfResults: boolean = true;
  startAt = 0;
  numOfItemsToReturn = 150;
  searchText: string = '';


  constructor(public navCtrl: NavController, public navParams: NavParams, private userService: UserService, private auth: AuthService, private googleAnalyticsEventsService: GoogleAnalyticsEventsService, private countryListService: CountryListService) {
    this.userToLookForReferrals = this.navParams.get('userToLookForReferrals');
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitCurrentPage(this.pageName);
    this.loadReferrals();
  }

  getPageTitle(): string {
    return this.checkIfLookingMyReferrals() ? `My referrals` : `${this.navParams.get('userToLookName')}'s referrals`;
  }

  checkIfLookingMyReferrals() {
    return (!this.userToLookForReferrals || (this.userToLookForReferrals === this.auth.currentUser.key));
  }

  loadReferrals() {
    let self = this;
    self.showSpinner = true;
    self.endOfResults = true;
    self.userService.getReferrals(this.auth.currentUser.key, this.userToLookForReferrals ? this.userToLookForReferrals : this.auth.currentUser.key, this.startAt, this.numOfItemsToReturn, this.searchText.substring(0, 15)).then((result: any) => {
      if (result) {
        self.referrals = self.referrals.concat(_.values(result.referrals));
        self.endOfResults = result.endOfResults;
      }
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

  status(user): string {
    return UserModel.StatusString(user.state);
  }

  searchItems() {
    this.referrals = [];
    this.loadReferrals();
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
