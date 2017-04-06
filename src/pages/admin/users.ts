import { NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { Component } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AuthService } from '../../services/auth';
import { Config } from '../../config/config';
import { UserPage } from './user';
import * as _ from 'lodash';
import * as log from 'loglevel';
import { Utils } from '../../services/utils';
import * as firebase from 'firebase';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

declare var window: any;
declare var jQuery: any;

@Component({
  templateUrl: 'users.html',
})
export class UsersPage {
  pageIndex = 0;
  numberOfPages = 0;
  PAGE_SIZE = 15;
  users: any[] = [];
  paginatedUsers: any[] = [];
  displayableUsers: any[] = [];
  showSpinner: boolean = false;
  searchTypes: string[];
  searchType: string;
  searchText: string;
  countries: any[];
  pageName = 'UsersPage';

  constructor(
    private nav: NavController,
    private navParams: NavParams,
    public platform: Platform,
    private translate: TranslateService,
    public auth: AuthService,
    private alertCtrl: AlertController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    this.countries = require('country-data').countries.all;
    this.searchTypes = ['Email', 'Phone', 'Full Name', 'Last Name', 'User Id', 'Sponsor Full Name', 'Sponsor User Id'];
    this.searchType = this.navParams.get('searchType') || this.searchTypes[0];
    this.searchText = this.navParams.get('searchType') && this.navParams.get('searchText') ? this.navParams.get('searchText') : 'eiland@ur.technology';
  }

  ngOnInit() {
    jQuery('.contentPage').css('top', Config.targetPlatform === 'ios' ? '63px' : '43px');
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
  }

  searchTextChanged() {
    if (this.paginatedUsers && this.paginatedUsers.length > 0) {
      this.paginatedUsers = this.numberOfPages = this.displayableUsers = undefined;
    }
  }

  searchUsers() {
    if (!this.auth.currentUser.admin) {
      this.googleAnalyticsEventsService.emitEvent(this.pageName, 'No admin user wanted to search for users', 'searchUsers()');
      return;
    }

    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Clicked on search users', 'searchUsers()');

    this.searchText = _.trim(this.searchText || '');
    if (!this.searchText) {
      return;
    }
    this.showSpinner = true;
    let usersRef: any = firebase.database().ref('/users');
    if (this.searchType === 'Email') {
      usersRef = usersRef.orderByChild('email').equalTo(this.searchText.toLowerCase());
    } else if (this.searchType === 'Phone') {
      usersRef = usersRef.orderByChild('phone').equalTo(this.searchText);
    } else if (this.searchType === 'Full Name') {
      usersRef = usersRef.orderByChild('name').equalTo(this.searchText);
    } else if (this.searchType === 'Last Name') {
      usersRef = usersRef.orderByChild('lastName').equalTo(this.searchText);
    } else if (this.searchType === 'User Id') {
      usersRef = usersRef.child(this.searchText);
    } else if (this.searchType === 'Sponsor Full Name') {
      usersRef = usersRef.orderByChild('sponsor/name').equalTo(this.searchText);
    } else if (this.searchType === 'Sponsor User Id') {
      usersRef = usersRef.orderByChild('sponsor/userId').equalTo(this.searchText);
    } else {
      throw 'unrecognized type';
    }
    usersRef.once('value').then((snapshot) => {
      let userMapping: any = snapshot.val() || {};
      let users = _.values(userMapping);
      let userIds = _.keys(userMapping);
      _.each(users, (user: any, index: number) => {
        user.userId = userIds[index];
        user.moveRequestedTag = user.moveRequested ? 'Move-Requested' : '';
        user.disabledTag = user.disabled ? 'Disabled' : '';
        user.fraudSuspectedTag = user.fraudSuspected ? 'Fraud-Suspected' : '';
        user.duplicateTag = user.duplicate ? 'Duplicate' : '';
        user.signUpBonusApprovedTag = user.signUpBonusApproved ? 'Bonus-Approved' : '';
      });
      users = _.sortBy(users, (u) => { return 1000000 - (u.downlineSize || 0); });
      this.paginatedUsers = _.chunk(users, this.PAGE_SIZE);
      this.numberOfPages = this.paginatedUsers.length;
      this.displayableUsers = this.paginatedUsers[0] || [];
      this.showSpinner = false;
    }, (error) => {
      log.warn(error);
      this.showSpinner = false;
    });
  }

  doInfinite(infiniteScroll) {
    if (!this.paginatedUsers) {
      return;
    }
    this.pageIndex++;
    if (this.pageIndex <= this.numberOfPages - 1) {
      this.displayableUsers = this.displayableUsers.concat(this.paginatedUsers[this.pageIndex] || []);
    }
    infiniteScroll.complete();
    if (this.pageIndex >= this.numberOfPages - 1) {
      infiniteScroll.enable(false);
    }
  }

  goToUserPage(user: any) {
    this.nav.push(UserPage, { user: user });
  }

  approveSignUpBonus(user: any) {
    user.signUpBonusApproved = true;
    user.signUpBonusApprovedTag = 'Bonus-Approved';
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Sign up bonus approved', 'approveSignUpBonus()');
    firebase.database().ref(`/users/${user.userId}`).update({ signUpBonusApproved: true })
      .then(() => {
        return firebase.database().ref('/walletCreatedQueue/tasks').push({
          userId: user.userId
        })
      })
      .then(() => {
      },
      (error) => {
        alert(error);
      })
      ;
    return false;
  }

  country(u) {
    let countryObject = this.countries.find((x) => { return x.alpha2 === (u.countryCode); });
    return (countryObject && countryObject.name) || (u.prefineryUser && u.prefineryUser.country) || 'None';
  }

  envModeDisplay() {
    return Utils.envModeDisplay();
  }
}
