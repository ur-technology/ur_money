import {ViewChild } from '@angular/core';
import {Page, NavController, NavParams, Content } from 'ionic-angular';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {Subscription} from 'rxjs';
import {Timestamp}  from '../../pipes/timestamp';
import * as _ from 'lodash';
import * as log from 'loglevel';
import {AuthService} from '../../services/auth';

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

  constructor(private nav: NavController, public navParams: NavParams, private angularFire: AngularFire, private auth: AuthService) {
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
    } else if (this.chatId) {
      this.lookupChatSummaryViaChatIdAndLoadMessages();
    }
    else {
      this.lookupChatSummaryViaContactAndLoadMessages();
    }
    this.resetMessageTextArea();
    this.adjustMessageTextAreaHeightBasedOnInput();
  }

  lookupChatSummaryViaChatIdAndLoadMessages() {
    let chatSummaryRef = firebase.database().ref(`/users/${this.auth.currentUserId}/chatSummaries/${this.chatId}`);
    chatSummaryRef.once('value', (snapshot) => {
      if (snapshot.exists()) {
        this.chatSummary = snapshot.val();
        this.loadMessages();
      } else {
        log.warn(`could not find chatSummary at ${chatSummaryRef.toString()}`)
      }
    });
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
          log.debug("chatSummary.users", chatSummary.users);
          log.debug("_.keys(chatSummary.users)", _.keys(chatSummary.users));
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

    let isFirstMessageInChat = this.chatSummaryUnsaved();
    if (this.chatSummaryUnsaved()) {
      this.saveChatSummary();
    }

    // add message to list of messages for this chat
    let messagesRef = firebase.database().ref(`/users/${this.auth.currentUserId}/chats/${this.chatId}/messages`);
    let message = { text: this.messageText, sentAt: firebase.database.ServerValue.TIMESTAMP, senderUserId: this.auth.currentUserId };
    let messageRef = messagesRef.push(message);
    this.loadMessages();

    // copy the message to the 'lastMessage' field of the chat summary associated with this chat
    let chatSummaryRef = firebase.database().ref(`/users/${this.auth.currentUserId}/chatSummaries`).child(this.chatId);
    chatSummaryRef.child("lastMessage").update(_.merge(message, { messageId: messageRef.key }));

    // add item to queue so that message is copied to chats, chatSummaries and notifications of other users
    if (isFirstMessageInChat) {
      firebase.database().ref('/chatSummaryCopyingQueue/tasks').push({
        userId: this.auth.currentUserId,
        chatId: this.chatId
      });
    }
    firebase.database().ref('/chatMessageCopyingQueue/tasks').push({
      userId: this.auth.currentUserId,
      chatId: this.chatId,
      messageId: messageRef.key,
      isFirstMessageInChat: isFirstMessageInChat
    });
    this.saveEvent();
    this.resetMessageTextArea();
  }

  saveEvent() {
    console.log("contact",this.contact);
    let eventRef = firebase.database().ref(`/users/${this.auth.currentUserId}/events/${this.chatId}`);
    eventRef.set({
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      messageText: `You: ${this.messageText}`,
      notificationProcessed: 'true',
      profilePhotoUrl: this.chatSummary.users[this.chatSummary.displayUserId].profilePhotoUrl,
      sourceId: this.chatId,
      sourceType: 'message',
      title: this.chatSummary.users[this.chatSummary.displayUserId].name,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
      userdId: this.chatSummary.displayUserId
    });
  }

  buildNewChatSummary() {
    this.chatSummary = {
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      pending: true,
      creatorUserId: this.auth.currentUserId,
      displayUserId: this.contact.userId,
      users: {}
    };
    this.chatSummary.users[this.auth.currentUserId] = _.pick(this.auth.currentUser, ['name', 'profilePhotoUrl']);
    this.chatSummary.users[this.contact.userId] = _.pick(this.contact, ['name', 'profilePhotoUrl']);
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
    if (this.contact) {
      return this.contact;
    }
    else {
      return this.chatSummary ? this.chatSummary.users[this.chatSummary.displayUserId] : "";
    }
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
