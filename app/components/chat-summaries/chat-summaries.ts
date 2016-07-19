import { Component } from '@angular/core';
import {Subscription} from 'rxjs';
import { NavController } from 'ionic-angular';
import {Auth} from '../../components/auth/auth';
import {ChatPage} from '../../pages/chat/chat';
import {Timestamp}  from '../../pipes/timestamp';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';

@Component({
  selector: 'chat-summaries',
  templateUrl: 'build/components/chat-summaries/chat-summaries.html',
  pipes: [Timestamp]
})
export class ChatSummaries {
  chats: any[];
  chatsRef: Subscription;
  user: any;

  constructor(private nav: NavController, auth: Auth, private angularFire: AngularFire) {
    this.user = auth.userObject;
  }

  loadChatSummaries() {
    this.chatsRef = this.angularFire.database.list(`/users/${this.user.$key}/chatSummaries`).subscribe(data => {
      this.chats = data;
    });
  }

  cleanResources() {
    if (this.chatsRef && !this.chatsRef.isUnsubscribed) {
      this.chatsRef.unsubscribe();
    }
  }

  whoSentMessage(chatSelected: any) {
    return chatSelected.lastMessage.senderUid === this.user.$key ? "You: " : "";
  }

  gotoChat(chatSelected: any) {
    this.nav.rootNav.push(ChatPage, { chatId: chatSelected.$key, user: { firstName: this.user.firstName, lastName: this.user.lastName, userUid: this.user.$key, profilePhotoUrl: this.user.profilePhotoUrl }, contact: { firstName: chatSelected.otherUser.firstName, lastName: chatSelected.otherUser.lastName, userUid: chatSelected.otherUser.userUid, profilePhotoUrl: chatSelected.profilePhotoUrl ? chatSelected.profilePhotoUrl : "" } }, { animate: true, direction: 'forward' });
  }

}
