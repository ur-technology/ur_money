import {Page, NavController, Platform} from 'ionic-angular';

import {TransactionComponent} from '../../components/transaction/transaction';

import {TransactionsEarnedPage} from './transaction-earned';
import {TransactionsReceivedPage} from './transaction-received';
import {TransactionsSentPage} from './transaction-sent';
import {HomePage} from '../home/home';
import {RequestPage} from '../request/request';
import {SendPage} from '../send/send';


@Page({
  templateUrl: 'build/pages/transactions/transactions.html',
})
export class TransactionsPage {
  android: boolean = false;
  transactionData: any;
  earnedTransactionPage: any;
  sentTransactionPage: any;
  receivedTransactionPage: any;
  homePage: any;
  sendPage: any;
  requestPage: any;
  selectedItem: any;
  invitePage: any;
  constructor(public nav: NavController, public platform: Platform) {

    this.earnedTransactionPage = TransactionsEarnedPage;
    this.receivedTransactionPage = TransactionsReceivedPage;
    this.sentTransactionPage = TransactionsSentPage;
    this.homePage = HomePage;
    this.sendPage = SendPage;
    this.requestPage = RequestPage;
    if (this.platform.is('android')) {
      this.android = true;
    }
    // this.transactionnavService.goToPageEmitter.subscribe((data) => {
    //   this.goToPage(data);
    // });

  }

  goToPage(page) {

    this.nav.setRoot(page, {}, { animate: true, direction: 'forward' });
  }


}
