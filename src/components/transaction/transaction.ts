import { Component, Input, Inject, SimpleChanges} from '@angular/core';
import { NavController} from 'ionic-angular';
import {BigNumber} from 'bignumber.js';
import {ChartDataService} from '../../services/chart-data';
import {AuthService} from '../../services/auth';
import * as _ from 'lodash';
import { FirebaseApp } from 'angularfire2';
import * as moment from 'moment';
import { App } from 'ionic-angular';
import {ContactsAndChatsPage} from '../../pages/contacts-and-chats/contacts-and-chats';
import {TranslateService} from 'ng2-translate/ng2-translate';

@Component({
  selector: 'transaction-component',
  templateUrl: 'transaction.html',
})
export class TransactionComponent {
  showSpinner: boolean = false;
  transactions = [];
  filteredTransactions = [];
  filteredTransactionsTotal: any = new BigNumber(0);
  lastUpdated: any;
  filterOption: string = 'all';
  availableBalance: number;
  @Input() transactionType: string;

  constructor(public auth: AuthService, public nav: NavController, public app: App, public translate: TranslateService, public chartData: ChartDataService, @Inject(FirebaseApp) firebase: any) {
  }

  ngOnInit() {
    let self = this;
    if (self.chartData.balanceUpdated) {
      this.availableBalance = this.chartData.balanceInfo.availableBalance;
    }
  }

  filterTransactions(newFilterOption?) {
    let self = this;
    if (newFilterOption) {
      self.filterOption = newFilterOption;
    }
    self.filteredTransactions = self.filterOption === 'all' ? self.transactions : _.filter(self.transactions, (transaction: any) => {
      return moment(transaction.updatedAt).isAfter(self.startTime());
    });
    self.filteredTransactionsTotal = new BigNumber(0);
    _.each(self.filteredTransactions, transaction => {
      self.filteredTransactionsTotal = self.filteredTransactionsTotal.plus(transaction.amount);
    });
    self.filteredTransactions = _.orderBy(self.filteredTransactions, 'updatedAt', ['desc']);
    self.lastUpdated = self.filteredTransactions.length > 0 ? _.last(self.filteredTransactions).updatedAt : '';
  }

  weiToURString(amount: any): string {
    let convertedAmount = (new BigNumber(amount)).dividedBy(1000000000000000000);
    return convertedAmount.toFormat(2);
  }

  selectedTransactionTypeTotal(): string {
    if (this.transactionType === 'all') {
      return (new BigNumber(this.availableBalance || 0)).toFormat(2);
    } else {
      return this.weiToURString(this.filteredTransactionsTotal);
    }
  }

  private loadTransactionsByType() {
    let self = this;
    self.showSpinner = true;
    let query = firebase.database().ref(`/users/${self.auth.currentUserId}/transactions/`).orderByChild('type');
    if (self.transactionType !== 'all') {
      query = query.equalTo(self.transactionType);
    }
    query.once('value', snapshot => {
      self.showSpinner = false;
      self.transactions = _.values(snapshot.val());
      self.filterTransactions();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
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

  selectedTransactionType(): string {
    return this.displayableTransactionType(this.transactionType);
  }

  displayableTransactionType(type): string {
    switch (type) {
      case 'sent':
        return this.translate.instant('transaction.sent');
      case 'received':
        return this.translate.instant('transaction.received');
      case 'earned':
        return this.translate.instant('transaction.earned');
      default:
        return 'UR';
    }
  }

}
