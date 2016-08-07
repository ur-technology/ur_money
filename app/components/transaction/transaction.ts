import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable, AuthMethods} from 'angularfire2'
import {AuthService} from '../../services/auth';
import * as _ from 'lodash';
import {Timestamp}  from '../../pipes/timestamp';
import * as moment from 'moment';
import {ContactsAndChatsPage} from '../../pages/contacts-and-chats/contacts-and-chats';
import {Round} from '../../pipes/round';
import {DateAndTime} from '../../pipes/dateAndTime.pipe';

@Component({
  selector: 'transaction-component',
  templateUrl: 'build/components/transaction/transaction.html',
  pipes: [Timestamp, Round, DateAndTime]
})
export class TransactionComponent {
  showSpinner: boolean = false;
  transactionDataAll = [];
  transactionDataFiltered = [];
  amount: number = 0;
  lastUpdated: any;
  filterOption: string = 'all';
  transactionType: string;

  constructor(private auth: AuthService, private nav: NavController) {
  }

  filterTransactions(filterOption) {
    this.filterOption = filterOption;
    this.transactionDataFiltered = filterOption === "all" ? this.transactionDataAll : _.filter(this.transactionDataAll, (transaction: any) => {
      let dateFromNowAppliedFilter = this._getDateFromNowAppliedFilter();
      return moment(transaction.createdAt).isAfter(dateFromNowAppliedFilter);
    });
    this.amount = _.sumBy(this.transactionDataFiltered, transaction => {
      return Number(transaction.amount);
    });
    this.lastUpdated = this.transactionDataFiltered.length > 0 ? _.last(_.sortBy(this.transactionDataFiltered, 'createdAt')).createdAt : "";
  }

  loadTransactionsByType(type: string) {
    this.transactionType = type;
    this.showSpinner = true;
    firebase.database().ref(`/users/${this.auth.currentUserId}/transactions/`)
      .orderByChild("type")
      .equalTo(type)
      .once("value", snapshot => {
        this.showSpinner = false;
        this.transactionDataAll = _.values(snapshot.val());
        this.filterTransactions(this.filterOption);
      });
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
    this.nav.rootNav.push(ContactsAndChatsPage, { goal: "invite" }, { animate: true, direction: 'forward' });
  }


}
