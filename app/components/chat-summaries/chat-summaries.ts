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

  constructor(private nav: NavController, private auth: Auth, private angularFire: AngularFire) {
  }

  ngOnInit() {
    this.loadChatSummaries();
  }

  loadChatSummaries() {
    this.angularFire.database.list(`/users/${this.auth.userObject.$key}/chatSummaries`).subscribe(data => {
      this.chats = data;
    });
  }

  whoSentMessage(chatSelected: any) {
    return chatSelected.lastMessage.senderUid === this.auth.userObject.$key ? "You: " : "";
  }

  gotoChat(chatSelected: any) {
    this.nav.rootNav.push(ChatPage, { chatId: chatSelected.$key, contact: { firstName: chatSelected.otherUser.firstName, lastName: chatSelected.otherUser.lastName, userUid: chatSelected.otherUser.userUid, profilePhotoUrl: chatSelected.profilePhotoUrl ? chatSelected.profilePhotoUrl : "" } }, { animate: true, direction: 'forward' });
  }

}
