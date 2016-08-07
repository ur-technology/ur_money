import {Component} from '@angular/core';
import {Subscription} from 'rxjs';
import {NavController } from 'ionic-angular';
import {AuthService} from '../../services/auth';
import {ChatPage} from '../../pages/chat/chat';
import {Timestamp}  from '../../pipes/timestamp';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';

@Component({
  selector: 'chat-list',
  templateUrl: 'build/components/chat-list/chat-list.html',
  pipes: [Timestamp]
})
export class ChatListComponent {
  chats: any[];
  x: any[];

  constructor(private nav: NavController, private auth: AuthService, private angularFire: AngularFire) {
  }

  ngOnInit() {
    this.load();
  }

  showNoChatsYetMessage() {
    return !this.chats || this.chats.length === 0;
  }

  load() {
    this.angularFire.database.list(`/users/${this.auth.currentUserId}/chatSummaries`).subscribe(data => {
      this.chats = data;
    });
  }

  senderLabel(chatSummary: any) {
    return chatSummary.lastMessage.senderUserId === this.auth.currentUserId ? "You: " : "";
  }

  displayUser(chatSummary: any) {
    if (!chatSummary.users[chatSummary.displayUserId]) {
      let x = 7;
    }
    return chatSummary.users[chatSummary.displayUserId];
  }

  gotoChat(chatSummary: any) {
    this.nav.rootNav.push(ChatPage, { chatSummary: chatSummary, chatId: chatSummary.$key }, { animate: true, direction: 'forward' });
  }

}
