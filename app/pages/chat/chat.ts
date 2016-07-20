import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import {ChatsPage} from '../chats/chats';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {Subscription} from 'rxjs';
import {Timestamp}  from '../../pipes/timestamp';
import * as _ from 'lodash';
import {Auth} from '../../components/auth/auth';


@Component({
  templateUrl: 'build/pages/chat/chat.html',
  pipes: [Timestamp]
})
export class ChatPage {
  messages: any[];
  user: any;
  contact: any;
  messageText: string;
  chatId: string;
  messagesRef: Subscription;
  @ViewChild(Content) content: Content;

  constructor(private nav: NavController, public navParams: NavParams, private angularFire: AngularFire, private auth: Auth) {
    this.contact = this.navParams.get('contact');
    this.chatId = this.navParams.get('chatId');
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 1);
  }

  ionViewLoaded() {
    this.findChatAndLoadMessages();
  }

  findChatAndLoadMessages() {
    if (this.chatId) {
      this.loadMessages();
    }
    else {
      this.findChatId(this.contact).then((chatId: string) => {
        this.chatId = chatId;
        this.loadMessages();

      });
    }
  }

  loadMessages() {
    this.messagesRef = this.angularFire.database.list(`/users/${this.auth.userObject.$key}/chats/${this.chatId}/messages`).subscribe(data => {
      this.messages = data;
      this.scrollToBottom();
    });
  }

  messageFromReceiver(message: any) {
    return message.senderUid !== this.auth.userObject.$key;
  }

  validateMessage(): boolean {
    if (!this.messageText) {
      return false;
    }
    if (_.isEmpty(this.messageText.trim())) {
      return false;
    }
    return true;
  }

  sendMessage() {
    if (!this.validateMessage()) {
      return;
    }
    //TODO: The reciver user has to have chats and chatSummaries created automatically
    this.createChat();
    let chatMessage = { text: this.messageText, sentAt: firebase.database.ServerValue.TIMESTAMP, senderUid: this.auth.userObject.$key, senderProfilePhotoUrl: this.auth.userObject.profilePhotoUrl };
    this.angularFire.database.object(`/users/${this.auth.userObject.$key}/chatSummaries/${this.chatId}`).set({ otherUser: this.contact, lastMessage: chatMessage });
    this.angularFire.database.list(`/users/${this.auth.userObject.$key}/chats/${this.chatId}/messages`).push(chatMessage);
    this.messageText = "";
  }

  //TODO: Notifications have to be saved to the receiver user collection by the NodeJS process
  // saveNotification(chatId: string, receiverUid: string, sender: any, chatMessage: any) {
  //   this.angularFire.database.list(`/users/${receiverUid}/notifications`).push({
  //     senderName: `${sender.firstName} ${sender.lastName}`,
  //     profilePhotoUrl: sender.profilePhotoUrl ? sender.profilePhotoUrl : "",
  //     text: chatMessage.text,
  //     chatId: chatId
  //   });
  // }

  createChat() {
    if (!this.chatId) {
      let chatRef = this.angularFire.database.list(`/users/${this.auth.userObject.$key}/chats`).push({ createdAt: firebase.database.ServerValue.TIMESTAMP });
      chatRef.child('/users').push({ firstName: this.auth.userObject.firstName, lastName: this.auth.userObject.lastName, userUid: this.auth.userObject.$key, profilePhotoUrl: this.auth.userObject.profilePhotoUrl });
      chatRef.child('/users').push(this.contact);
      this.chatId = chatRef.key;
      this.loadMessages();
    }
  }

  ionViewWillLeave() {
    if (this.messagesRef && !this.messagesRef.isUnsubscribed) {
      this.messagesRef.unsubscribe();
    }
  }

  findChatId(user2: any) {
    return new Promise((resolve) => {
      firebase.database().ref(`/users/${this.auth.userObject.$key}/chatSummaries`).once('value', snapshot => {
        snapshot.forEach(childSnapshot => {
          if (childSnapshot.val().otherUser.userUid === user2.userUid) {
            resolve(childSnapshot.key);
            return true;
          }
        });
      })
    });
  }

}
