import {Page, NavController, NavParams, Platform} from 'ionic-angular';
import {ContactsComponent} from '../../components/contacts/contacts';
import {ChatListComponent} from '../../components/chat-list/chat-list';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {AuthService} from '../../services/auth';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/contacts-and-chats/contacts-and-chats.html',
  directives: [ContactsComponent, ChatListComponent],
  pipes: [TranslatePipe]
})
export class ContactsAndChatsPage {
  contactsPage: any;
  goal: any;
  chatsPage: any;
  segmentSelected: string = 'contacts';

  constructor(private nav: NavController, private navParams: NavParams, public platform: Platform, private translate: TranslateService, public auth: AuthService) {
    this.goal = navParams.get('goal');
  }

  ngOnInit() {
    jQuery('.contentPage').css('top', this.platform.is('ios') ? '63px' : '43px');
  }

  goalChanged(data) {
    this.goal = data.goal;
  }

  getPageTitle() {
    switch (this.goal) {
      case 'chat':
        return this.translate.instant('contacts-and-chats.titleChat');
      case 'send':
        return this.translate.instant('contacts-and-chats.titleSend');
      case 'request':
        return this.translate.instant('contacts-and-chats.titleRequest');
      case 'invite':
        return this.translate.instant('contacts-and-chats.titleInvite');
    }
  }

}
