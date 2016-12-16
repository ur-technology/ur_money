import { NavController, NavParams, Platform, AlertController} from 'ionic-angular';
import { Inject, Component} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {AuthService} from '../../services/auth';
import {Config} from '../../config/config';
import {UserPage} from './user';
import * as _ from 'lodash';
import * as log from 'loglevel';
import { FirebaseApp } from 'angularfire2';

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

  constructor(
    private nav: NavController,
    private navParams: NavParams,
    public platform: Platform,
    private translate: TranslateService,
    public auth: AuthService,
    private alertCtrl: AlertController,
    @Inject(FirebaseApp) firebase: any
  ) {
      this.searchTypes = ['Email', 'Phone', 'Full Name', 'Last Name', 'User Id', 'Sponsor Full Name', 'Sponsor User Id'];
      this.searchType = this.navParams.get('searchType') || this.searchTypes[0];
      this.searchText = !!this.navParams.get('searchType') && this.navParams.get('searchText') ? this.navParams.get('searchText') : '';
      if (this.searchText) {
        this.searchUsers();
      }
  }

  ngOnInit() {
    jQuery('.contentPage').css('top', Config.targetPlatform === 'ios' ? '63px' : '43px');
  }

  ngAfterViewInit() {
  }

  searchUsers() {
    if (!_.trim(this.searchText || '')) {
      return;
    }
    this.showSpinner = true;
    let usersRef: any = firebase.database().ref('/users');
    if (this.searchType === 'Email') {
      usersRef = usersRef.orderByChild('email').equalTo(this.searchText);
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
      });
      this.paginatedUsers = _.chunk(users, this.PAGE_SIZE);
      this.numberOfPages = this.paginatedUsers.length;
      this.displayableUsers = this.paginatedUsers[0];
      this.showSpinner = false;
    }, (error) => {
      log.warn(error);
      this.showSpinner = false;
    });
  }

  doInfinite(infiniteScroll) {
    this.pageIndex++;
    if (this.pageIndex <= this.numberOfPages - 1) {
      this.displayableUsers = this.displayableUsers.concat(this.paginatedUsers[this.pageIndex]);
    }
    infiniteScroll.complete();
    if (this.pageIndex >= this.numberOfPages - 1) {
      infiniteScroll.enable(false);
    }
  }

  goToUserPage(user: any) {
    this.nav.push(UserPage, { user: user }, { animate: true, direction: 'forward' });
  }

}
