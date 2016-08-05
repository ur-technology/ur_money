import {Page, NavController} from 'ionic-angular';
import {ViewChild} from '@angular/core';
import {TransactionComponent} from '../../components/transaction/transaction';

@Page({
  templateUrl: 'build/pages/transactions/transaction-received.html',
  directives: [TransactionComponent]
})
export class TransactionsReceivedPage {
  @ViewChild(TransactionComponent) transactionComponent: TransactionComponent;

  constructor(public nav: NavController) {

  }

  ionViewLoaded() {
    this.transactionComponent.loadTransactionsByType("received");
  }

}
