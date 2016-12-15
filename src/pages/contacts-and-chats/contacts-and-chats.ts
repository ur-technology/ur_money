import { NavController, NavParams, Platform} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {AuthService} from '../../services/auth';
import {Config} from '../../config/config';
import { Component } from '@angular/core';

declare var jQuery: any;

@Component({
  templateUrl: 'contacts-and-chats.html',
})
export class ContactsAndChatsPage {
  contactsPage: any;
  goal: any;
  chatsPage: any;
  segmentSelected: string = 'contacts';

  constructor(public nav: NavController, public navParams: NavParams, public platform: Platform, public translate: TranslateService, public auth: AuthService) {
    this.goal = navParams.get('goal');
  }

  ngOnInit() {
    jQuery('.contentPage').css('top', Config.targetPlatform === 'ios' ? '63px' : '43px');
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
