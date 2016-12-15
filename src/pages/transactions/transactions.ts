import { NavController, Platform} from 'ionic-angular';
import {HomePage} from '../home/home';
import {ContactsAndChatsPage} from '../../pages/contacts-and-chats/contacts-and-chats';
import { Component } from '@angular/core';

@Component({
  selector: 'transactions-page',
  templateUrl: 'transactions.html',
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
