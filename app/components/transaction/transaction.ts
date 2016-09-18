import { Component, Input, AfterViewInit, OnInit, OnChanges} from '@angular/core';
import { NavController} from 'ionic-angular';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable, AuthMethods} from 'angularfire2'
import {BigNumber} from 'bignumber.js'

import {AuthService} from '../../services/auth';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';
import {Timestamp}  from '../../pipes/timestamp';
import * as moment from 'moment';
import { App } from 'ionic-angular';
import {ContactsAndChatsPage} from '../../pages/contacts-and-chats/contacts-and-chats';
import {DateAndTime} from '../../pipes/dateAndTime.pipe';
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";

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
    this.filteredTransactions = this.filterOption === "all" ? this.transactions : _.filter(this.transactions, (transaction: any) => {
      return moment(transaction.updatedAt).isAfter(this.startTime());
    });
    this.filteredTransactionsTotal = new BigNumber(0);
    _.each(this.filteredTransactions, transaction => {
      this.filteredTransactionsTotal = this.filteredTransactionsTotal.plus(transaction.amount);
    });
    this.lastUpdated = this.filteredTransactions.length > 0 ? _.last(_.sortBy(this.filteredTransactions, 'updatedAt')).updatedAt : "";
  }

  private weiToURString(amount: any): string {
    let convertedAmount = (new BigNumber(amount)).dividedBy(1000000000000000000);
    return convertedAmount.toFormat(2);
  }

  private isPrivilegedTransaction(transaction: any): boolean {
    let privilegedAddresses = [
      "0x5d32e21bf3594aa66c205fde8dbee3dc726bd61d",
      "0x9194d1fa799d9feb9755aadc2aa28ba7904b0efd",
      "0xab4b7eeb95b56bae3b2630525b4d9165f0cab172",
      "0xea82e994a02fb137ffaca8051b24f8629b478423",
      "0xb1626c3fc1662410d85d83553d395cabba148be1",
      "0x65afd2c418a1005f678f9681f50595071e936d7c",
      "0x49158a28df943acd20be7c8e758d8f4a9dc07d05"
    ];
    return _.includes(privilegedAddresses, transaction.urTransaction.from);
  }

  private loadTransactionsByType() {
    let self = this;
    self.showSpinner = true;
    firebase.database().ref(`/users/${self.auth.currentUserId}/transactions/`)
      .orderByChild("type")
      .equalTo(self.transactionType)
      .once("value", snapshot => {
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
        startTimeValue.add(-60, 'days')
        break;
      case 'all':
      default:
        return;
    }
    return startTimeValue;
  }

  invite() {
    this.app.getRootNav().push(ContactsAndChatsPage, { goal: "invite" }, { animate: true, direction: 'forward' });
  }

  getTransactionType(): string {
    if (this.transactionType === 'sent') {
      return this.translate.instant("transaction.sent");
    }
    else if (this.transactionType === 'received') {
      return this.translate.instant("transaction.received");
    }
    else {
      return this.translate.instant("transaction.earned");
    }
  }

}
