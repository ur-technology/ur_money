import {Page, NavController, Platform} from 'ionic-angular';
import {TransactionComponent} from '../../components/transaction/transaction';
import {HomePage} from '../home/home';
import {ContactsAndChatsPage} from '../../pages/contacts-and-chats/contacts-and-chats';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

@Page({
  templateUrl: 'build/pages/transactions/transactions.html',
  directives: [TransactionComponent],
  pipes: [TranslatePipe]
})
export class TransactionsPage {
  segmentSelected: any = 'all';

  constructor(public nav: NavController, public platform: Platform) {
  }

  goToPage(page: string) {
    switch (page) {
      case 'home':
        this.nav.setRoot(HomePage, {}, { animate: true, direction: 'forward' });
        break;
      case 'request':
        this.nav.push(ContactsAndChatsPage, { goal: 'request' }, { animate: true, direction: 'forward' });
        break;
      case 'send':
        this.nav.push(ContactsAndChatsPage, { goal: 'send' }, { animate: true, direction: 'forward' });
        break;
      case 'invite':
        this.nav.push(ContactsAndChatsPage, { goal: 'invite' }, { animate: true, direction: 'forward' });
        break;
    }

  }


}
