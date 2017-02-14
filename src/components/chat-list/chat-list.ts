import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthService } from '../../services/auth';
import { ChatPage } from '../../pages/chat/chat';
import { App } from 'ionic-angular';
import { AngularFire } from 'angularfire2';
import { TranslateService } from 'ng2-translate/ng2-translate';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'chat-list',
  templateUrl: 'chat-list.html',
})
export class ChatListComponent {
  chats: any[];
  x: any[];
  chatSummarySubscription: Subscription;

  constructor(public nav: NavController, public auth: AuthService, public angularFire: AngularFire, public app: App, public translate: TranslateService) {
  }

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    if (this.chatSummarySubscription && !this.chatSummarySubscription.closed) {
      this.chatSummarySubscription.unsubscribe();
    }
  }

  showNoChatsYetMessage() {
    return !this.chats || this.chats.length === 0;
  }

  load() {
    this.chatSummarySubscription = this.angularFire.database.list(`/users/${this.auth.currentUserId}/chatSummaries`).subscribe(data => {
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
    this.app.getRootNav().push(ChatPage, { chatSummary: chatSummary, chatId: chatSummary.$key });
  }

}
