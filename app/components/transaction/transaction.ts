import { Component, Input} from '@angular/core';
import { NavController} from 'ionic-angular';
import {BigNumber} from 'bignumber.js';

import {AuthService} from '../../services/auth';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import {Timestamp}  from '../../pipes/timestamp';
import * as moment from 'moment';
import { App } from 'ionic-angular';
import {ContactsAndChatsPage} from '../../pages/contacts-and-chats/contacts-and-chats';
import {DateAndTime} from '../../pipes/dateAndTime.pipe';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';

@Component({
  selector: 'transaction-component',
  templateUrl: 'build/components/transaction/transaction.html',
  pipes: [Timestamp, DateAndTime, TranslatePipe]
})
export class TransactionComponent {
  showSpinner: boolean = false;
  transactions = [];
  filteredTransactions = [];
  filteredTransactionsTotal: BigNumber = new BigNumber(0);
  lastUpdated: any;
  filterOption: string = 'all';
  @Input() transactionType: string;

  constructor(private auth: AuthService, private nav: NavController, private app: App, private translate: TranslateService) {
  }

  filterTransactions(newFilterOption?) {
    if (newFilterOption) {
      this.filterOption = newFilterOption;
    }
    this.filteredTransactions = this.filterOption === 'all' ? this.transactions : _.filter(this.transactions, (transaction: any) => {
      return moment(transaction.updatedAt).isAfter(this.startTime());
    });
    this.filteredTransactionsTotal = new BigNumber(0);
    _.each(this.filteredTransactions, transaction => {
      this.filteredTransactionsTotal = this.filteredTransactionsTotal.plus(transaction.amount);
    });
    this.lastUpdated = this.filteredTransactions.length > 0 ? _.last(_.sortBy(this.filteredTransactions, 'updatedAt')).updatedAt : '';
  }

  private loadTransactionsByType() {
    let self = this;
    self.showSpinner = true;
    firebase.database().ref(`/users/${self.auth.currentUserId}/transactions/`)
      .orderByChild('type')
      .equalTo(self.transactionType)
      .once('value', snapshot => {
        self.showSpinner = false;
        self.transactions = _.values(snapshot.val());
        self.filterTransactions();
      });
  }

  ngOnChanges() {
    this.loadTransactionsByType();
  }

  private startTime() {
    let startTimeValue: any = moment('0', 'HH');
    switch (this.filterOption) {
      case 'today':
        break;
      case '30':
        startTimeValue.add(-30, 'days');
        break;
      case '60':
        startTimeValue.add(-60, 'days');
        break;
      case 'all':
      default:
        return;
    }
    return startTimeValue;
  }

  invite() {
    this.app.getRootNav().push(ContactsAndChatsPage, { goal: 'invite' }, { animate: true, direction: 'forward' });
  }

  getTransactionType(): string {
    if (this.transactionType === 'sent') {
      return this.translate.instant('transaction.sent');
    } else if (this.transactionType === 'received') {
      return this.translate.instant('transaction.received');
    } else {
      return this.translate.instant('transaction.earned');
    }
  }

}
