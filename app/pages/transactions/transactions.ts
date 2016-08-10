import {Page, NavController, Platform} from 'ionic-angular';
import {TransactionComponent} from '../../components/transaction/transaction';
import {TransactionsEarnedPage} from './transaction-earned';
import {TransactionsReceivedPage} from './transaction-received';
import {TransactionsSentPage} from './transaction-sent';
import {HomePage} from '../home/home';
import {RequestPage} from '../request/request';
import {SendPage} from '../send/send';
import {ContactsAndChatsPage} from '../../pages/contacts-and-chats/contacts-and-chats';

@Page({
  templateUrl: 'build/pages/transactions/transactions.html',
})
export class TransactionsPage {
  android: boolean = false;
  transactionData: any;
  earnedTransactionPage: any;
  sentTransactionPage: any;
  receivedTransactionPage: any;
  constructor(public nav: NavController, public platform: Platform) {
    this.earnedTransactionPage = TransactionsEarnedPage;
    this.receivedTransactionPage = TransactionsReceivedPage;
    this.sentTransactionPage = TransactionsSentPage;
    if (this.platform.is('android')) {
      this.android = true;
    }
  }

  goToPage(page: string) {
    switch (page) {
      case 'home':
        this.nav.setRoot(HomePage, {}, { animate: true, direction: 'forward' });
        break;
      case 'request':
        this.nav.rootNav.push(ContactsAndChatsPage, { goal: "request" }, { animate: true, direction: 'forward' });
        break;
      case 'send':
        this.nav.push(ContactsAndChatsPage, { goal: "send" }, { animate: true, direction: 'forward' });
        break;
      case 'invite':
        this.nav.rootNav.push(ContactsAndChatsPage, { goal: "invite" }, { animate: true, direction: 'forward' });
        break;
    }

  }


}
