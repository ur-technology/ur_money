import { Component, Input, AfterViewInit , OnInit, OnChanges} from '@angular/core';
import { NavController} from 'ionic-angular';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable, AuthMethods} from 'angularfire2'
import {BigNumber} from 'bignumber.js'

import {AuthService} from '../../services/auth';
import * as _ from 'lodash';
import {Timestamp}  from '../../pipes/timestamp';
import * as moment from 'moment';
import { App } from 'ionic-angular';
import {ContactsAndChatsPage} from '../../pages/contacts-and-chats/contacts-and-chats';
import {DateAndTime} from '../../pipes/dateAndTime.pipe';

@Component({
  selector: 'transaction-component',
  templateUrl: 'build/components/transaction/transaction.html',
  pipes: [Timestamp, DateAndTime]
})
export class TransactionComponent {
  showSpinner: boolean = false;
  transactionDataAll = [];
  transactionDataFiltered = [];
  transactionTotal: BigNumber = new BigNumber(0);
  lastUpdated: any;
  filterOption: string = 'all';
  @Input() transactionType: string;

  constructor(private auth: AuthService, private nav: NavController, private app: App) {
  }

  filterTransactions(filterOption) {
    this.filterOption = filterOption;
    this.transactionDataFiltered = filterOption === "all" ? this.transactionDataAll : _.filter(this.transactionDataAll, (transaction: any) => {
      let dateFromNowAppliedFilter = this._getDateFromNowAppliedFilter();
      return moment(transaction.createdAt).isAfter(dateFromNowAppliedFilter);
    });
    this.transactionTotal = new BigNumber(0);
    _.each(this.transactionDataFiltered, transaction => {
      this.transactionTotal = this.transactionTotal.plus(transaction.urTransaction.value);
    });
    this.lastUpdated = this.transactionDataFiltered.length > 0 ? _.last(_.sortBy(this.transactionDataFiltered, 'createdAt')).createdAt : "";
  }

  private urAmount(weiAmount: any) {
    let amount = new BigNumber(weiAmount).dividedBy(1000000000000000000);
    return amount.modulo(0.01) == new BigNumber(0) ? amount.toPrecision(2) : amount.toPrecision();
  }

  private loadTransactionsByType() {
    let self = this;
    self.showSpinner = true;
    firebase.database().ref(`/users/${self.auth.currentUserId}/transactions/`)
      .orderByChild("type")
      .equalTo(self.transactionType)
      .once("value", snapshot => {
        self.showSpinner = false;
        self.transactionDataAll = _.values(snapshot.val());
        self.filterTransactions(self.filterOption);
      });
  }

  ngOnChanges(){
    this.loadTransactionsByType();
  }

  private _getDateFromNowAppliedFilter() {
    let todayWithDayStartTime: any = moment('0', 'HH');
    switch (this.filterOption) {
      case 'today':
        break;
      case '30':
        todayWithDayStartTime.add(-30, 'days');
        break;
      case '60':
        todayWithDayStartTime.add(-60, 'days')
        break;
      case 'all':
      default:
        return;
    }
    return todayWithDayStartTime;
  }

  invite() {
    this.app.getRootNav().push(ContactsAndChatsPage, { goal: "invite" }, { animate: true, direction: 'forward' });
  }


}
