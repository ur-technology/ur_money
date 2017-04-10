import { Component, Input, SimpleChanges } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import Decimal from 'decimal.js';
import { ChartDataService } from '../../services/chart-data.service';
import { AuthService } from '../../services/auth';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as moment from 'moment';
import { App } from 'ionic-angular';
import { ContactsAndChatsPage } from '../../pages/contacts-and-chats/contacts-and-chats';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Config } from '../../config/config';
import { InviteLinkPage } from '../../pages/invite-link/invite-link';


@Component({
  selector: 'transaction-component',
  templateUrl: 'transaction.html',
})
export class TransactionComponent {
  showSpinner: boolean = false;
  transactions = [];
  filteredTransactions = [];
  filteredTransactionsTotal: any = new Decimal(0);
  lastUpdated: any;
  filterOption: string = 'all';
  lastValue: any;
  numberOfItemsToShow: number = 20;
  @Input() transactionType: string;

  constructor(public auth: AuthService, public nav: NavController, public app: App, public translate: TranslateService, public chartData: ChartDataService, private alertCtrl: AlertController) {
  }

  filterTransactions(newFilterOption?) {
    let self = this;
    if (newFilterOption) {
      self.filterOption = newFilterOption;
    }
    self.filteredTransactions = self.filterOption === 'all' ? self.transactions : _.filter(self.transactions, (transaction: any) => {
      return moment(transaction.updatedAt).isAfter(self.startTime());
    });
    self.filteredTransactionsTotal = new Decimal(0);
    _.each(self.filteredTransactions, transaction => {
      self.filteredTransactionsTotal = self.filteredTransactionsTotal.plus(transaction.amount);
    });
    self.filteredTransactions = _.orderBy(self.filteredTransactions, 'updatedAt', ['desc']);
    self.lastUpdated = self.filteredTransactions.length > 0 ? _.last(self.filteredTransactions).updatedAt : '';
  }

  weiToURString(amount: any): string {
    let convertedAmount = (new Decimal(amount)).dividedBy(1000000000000000000);
    return convertedAmount;
  }

  selectedTransactionTypeTotal(): string {
    if (this.transactionType === 'all') {
      return this.auth.currentBalanceUR();
    } else {
      return this.weiToURString(this.filteredTransactionsTotal);
    }
  }

  private loadTransactionsByType() {
    let self = this;
    let query;

    if (self.transactionType === 'all') {
      self.showSpinner = self.transactions.length === 0 ? true : false;
      query = firebase.database().ref(`/users/${self.auth.currentUserId}/transactions/`).orderByChild('updatedAt');
      if (self.lastValue) {
        query = query.endAt(self.lastValue);
      }
      query = query.limitToLast(self.numberOfItemsToShow);
      query.once('value', snapshot => {
        let tempArray = [];
        let obj;
        for (let key in snapshot.val()) {
          obj = snapshot.val()[key];
          obj.key = key;
          tempArray.push(obj);
        }

        self.transactions = _.unionBy(self.transactions, tempArray, 'key');

        self.transactions = _.orderBy(self.transactions, 'updatedAt', ['desc']);
        if (self.transactions.length > 0) {
          self.lastValue = self.transactions[self.transactions.length - 1].updatedAt;
        }

        self.filterTransactions();
        self.showSpinner = false;
      });

    } else {
      self.showSpinner = true;
      query = firebase.database().ref(`/users/${self.auth.currentUserId}/transactions/`).orderByChild('type');
      query = query.equalTo(self.transactionType);
      query.once('value', snapshot => {
        self.showSpinner = false;
        self.transactions = _.values(snapshot.val());
        self.filterTransactions();
      });
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    this.resetVariables();
    this.loadTransactionsByType();
  }

  private resetVariables() {
    this.lastValue = null;
    this.transactions = [];
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
    if (!this.auth.announcementConfirmed()) {
      let alert = this.alertCtrl.create({
        subTitle: this.translate.instant('home.noInvitesAllowed'),
        buttons: [this.translate.instant('dismiss')]
      });
      alert.present();
    } else {
      if (Config.targetPlatform === 'web') {
        this.nav.push(InviteLinkPage);
      } else {
        this.nav.push(ContactsAndChatsPage, { goal: 'invite' });
      }
    }
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
