import {ViewChild } from '@angular/core';
import {Page, NavController, NavParams, Content } from 'ionic-angular';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {Subscription} from 'rxjs';
import {Timestamp}  from '../../pipes/timestamp';
import * as _ from 'lodash';
import {Auth} from '../../components/auth/auth';

declare var jQuery: any;

@Page({
  templateUrl: 'build/pages/chat/chat.html',
  pipes: [Timestamp]
})
export class ChatPage {
  messages: any[];
  user: any;
  contact: any;
  messageText: string;
  chatId: string;
  chatSummary: any;
  messagesRef: Subscription;
  messageTextAreaHeight: number;
  @ViewChild(Content) content: Content;

  constructor(private nav: NavController, public navParams: NavParams, private angularFire: AngularFire, private auth: Auth) {
    // NOTE: either contact or chatSummary+chatId should be passed to this page via NavParams
    this.contact = this.navParams.get('contact');
    this.chatSummary = this.navParams.get('chatSummary');
    this.chatId = this.navParams.get('chatId'); // TODO: maybe include this field in chatSummary
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 1);
  }

  ionViewLoaded() {
    if (this.chatSummary) {
      this.loadMessages();
    } else {
      this.lookupChatSummaryViaContactAndLoadMessages();
    }
    this.resetMessageTextArea();
    this.adjustMessageTextAreaHeightBasedOnInput();
  }

  adjustMessageTextAreaHeightBasedOnInput() {
    const MESSAGE_TEXT_AREA_MAXIMUM_HEIGHT = 115;
    const MESSAGE_TEXT_AREA_ROW_HEIGHT = 19;

    jQuery("textarea").on("input", event => {
      this.messageTextAreaHeight = Math.min(event.target.scrollHeight, MESSAGE_TEXT_AREA_MAXIMUM_HEIGHT);
      event.target.rows = this.messageTextAreaHeight / MESSAGE_TEXT_AREA_ROW_HEIGHT;
    });
  }

  lookupChatSummaryViaContactAndLoadMessages() {
    let self = this;
    firebase.database().ref(`/users/${self.auth.currentUser.$key}/chatSummaries`).once('value', (chatSummariesSnapshot) => {
      if (chatSummariesSnapshot.exists()) {
        let chatSummaries = chatSummariesSnapshot.val();
        self.chatId = _.findKey(chatSummaries, (chatSummary: any, chatId: string) => {
          console.log("chatSummary.users", chatSummary.users);
          console.log("_.keys(chatSummary.users)", _.keys(chatSummary.users));
          return _.includes(_.keys(chatSummary.users), self.contact.userId);
        });
        if (self.chatId) {
          self.chatSummary = chatSummaries[self.chatId];
          self.loadMessages();
        }
      }
      if (!self.chatSummary) {
        this.buildNewChatSummary();
      }
    });
  }

  loadMessages() {
    this.messagesRef = this.angularFire.database.list(`/users/${this.auth.currentUserId}/chats/${this.chatId}/messages`).subscribe(data => {
      this.messages = data;
      this.scrollToBottom();
    });
  }

  isMessageFromReceiver(message: any) {
    return message.senderUserId !== this.auth.currentUserId;
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

    if (this.chatSummaryUnsaved()) {
      this.saveChatSummary();
    }
    let chatSummaryRef = firebase.database().ref(`/users/${this.auth.currentUserId}/chatSummaries`).child(this.chatId);

    let messagesRef = firebase.database().ref(`/users/${this.auth.currentUserId}/chats/${this.chatId}/messages`);
    let message = { text: this.messageText, sentAt: firebase.database.ServerValue.TIMESTAMP, senderUserId: this.auth.currentUserId };
    let messageRef = messagesRef.push(message);
    this.loadMessages();

    chatSummaryRef.child("lastMessage").update(_.merge(message, { needsToBeCopied: true, messageId: messageRef.key }));
    this.resetMessageTextArea();
  }

  // TODO: not sure if I broke this - JR
  saveNotification(chatId: string, userId: string, sender: any, text: any) {
    this.angularFire.database.list(`/users/${userId}/notifications`).push({
      senderName: `${sender.firstName} ${sender.lastName}`,
      profilePhotoUrl: sender.profilePhotoUrl ? sender.profilePhotoUrl : "",
      text: text,
      chatId: chatId
    });
  }

  buildNewChatSummary() {
    this.chatSummary = {
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      needsToBeCopied: true,
      creatorUserId: this.auth.currentUserId,
      displayUserId: this.contact.userId,
      users: {}
    };
    this.chatSummary.users[this.auth.currentUserId] = _.pick(this.auth.currentUser, ['firstName', 'lastName', 'profilePhotoUrl']);
    this.chatSummary.users[this.contact.userId] = _.pick(this.contact, ['firstName', 'lastName', 'profilePhotoUrl']);
    // TODO: handle the case where firstName + lastName of the contact do not match that of /users/${contact.userId}
  }

  private chatSummaryUnsaved() {
    return !this.chatId;
  }

  saveChatSummary() {
    let chatSummariesRef = firebase.database().ref(`/users/${this.auth.currentUserId}/chatSummaries`);
    let chatSummaryRef = chatSummariesRef.push(this.chatSummary);
    this.chatId = chatSummaryRef.key;
  }

  ionViewWillLeave() {
    if (this.messagesRef && !this.messagesRef.isUnsubscribed) {
      this.messagesRef.unsubscribe();
    }
  }

  displayUser() {
    return this.chatSummary.users[this.chatSummary.displayUserId];
  }

  sender(message) {
    return this.chatSummary.users[message.senderUserId];
  }

  resetMessageTextArea() {
    this.messageText = "";
    this.messageTextAreaHeight = 38;
    jQuery("textarea")[0].rows = 2;
  }
}
