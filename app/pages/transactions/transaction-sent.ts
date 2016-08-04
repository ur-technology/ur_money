import {Page, NavController} from 'ionic-angular';
import {ViewChild} from '@angular/core';
import {TransactionComponent} from '../../components/transaction/transaction.component';

@Page({
  templateUrl: 'build/pages/transactions/transaction-sent.html',
  directives: [TransactionComponent]
})
export class TransactionsSentPage {
  @ViewChild(TransactionComponent) transactionComponent: TransactionComponent;

  constructor(public nav: NavController) {

  }

  ionViewLoaded() {    
    this.transactionComponent.loadTransactionsByType("sent");
  }
}
