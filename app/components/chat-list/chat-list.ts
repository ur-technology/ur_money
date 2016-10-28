import {Component} from '@angular/core';
import {NavController } from 'ionic-angular';
import {AuthService} from '../../services/auth';
import {ChatPage} from '../../pages/chat/chat';
import {Timestamp}  from '../../pipes/timestamp';
import { App } from 'ionic-angular';
import {AngularFire} from 'angularfire2';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import * as _ from 'lodash';

@Component({
  selector: 'chat-list',
  templateUrl: 'build/components/chat-list/chat-list.html',
  pipes: [Timestamp, TranslatePipe]
})
export class ChatListComponent {
  chats: any[];
  x: any[];

  constructor(private nav: NavController, private auth: AuthService, private angularFire: AngularFire, private app: App, private translate: TranslateService) {
  }

  ngOnInit() {
    this.load();
  }

  showNoChatsYetMessage() {
    return !this.chats || this.chats.length === 0;
  }

  load() {
    this.angularFire.database.list(`/users/${this.auth.currentUserId}/chatSummaries`).subscribe(data => {
      this.chats = _.filter(data, (chatSummary: any) => {
        return chatSummary.lastMessage;
      });
    });
  }

  senderLabel(chatSummary: any) {
    return chatSummary.lastMessage.senderUserId === this.auth.currentUserId ? `${this.translate.instant('you')}: ` : '';
  }

  displayUser(chatSummary: any) {
    return chatSummary.users[chatSummary.displayUserId];
  }

  gotoChat(chatSummary: any) {
    this.app.getRootNav().push(ChatPage, { chatSummary: chatSummary, chatId: chatSummary.$key }, { animate: true, direction: 'forward' });
  }

}
