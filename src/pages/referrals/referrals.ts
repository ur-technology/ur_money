import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth';
import { UserModel } from '../../models/user.model';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';
import * as _ from 'lodash';
import { ChatPage } from '../../pages/chat/chat';
import { CountryListService } from '../../services/country-list';
import { ToastService } from '../../services/toast';

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
  @ViewChild('textHolder') inputTextHolder;

  constructor(public navCtrl: NavController, public navParams: NavParams, private userService: UserService, private auth: AuthService, private googleAnalyticsEventsService: GoogleAnalyticsEventsService, private countryListService: CountryListService, private toastService: ToastService) {
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

  copyToClipboard(referral, event) {
    event.stopPropagation();
    let textToBeCopied = this.checkIfLookingMyReferrals() ? `Name: ${referral.name} Phone: ${referral.phone} Email: ${referral.email}` : `Name: ${referral.name}`;
    this.inputTextHolder.nativeElement.setAttribute("value", textToBeCopied);
    this.inputTextHolder.nativeElement.select();
    var succeeded;
    try {
      succeeded = document.execCommand("copy");
    } catch (e) {
      succeeded = false;
    }
    if (succeeded) {
      this.toastService.showMessage({ message: 'Text copied', duration: 1000 });
    }

  }

}
