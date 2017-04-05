import { ViewChild, Component } from '@angular/core';
import { NavController, NavParams, Platform, Content, AlertController, PopoverController } from 'ionic-angular';
import { AngularFire } from 'angularfire2';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';
import { AuthService } from '../../services/auth';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { PopoverChatPage } from './popover-chat';
import { Keyboard } from 'ionic-native';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';

declare var jQuery: any;

@Component({
  selector: 'chat-page',
  templateUrl: 'chat.html',
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
  pageName = 'ChatPage';

  constructor(public nav: NavController, public navParams: NavParams, public platform: Platform, public angularFire: AngularFire, public auth: AuthService, public translate: TranslateService, public alertCtrl: AlertController, public popoverCtrl: PopoverController,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    // NOTE: either contact or chatSummary+chatId should be passed to this page via NavParams
    this.contact = this.navParams.get('contact');
    this.chatSummary = this.navParams.get('chatSummary');
    this.chatId = this.navParams.get('chatId'); // TODO: maybe include this field in chatSummary
    if (this.platform.is('android')) {
      Keyboard.onKeyboardShow().subscribe(e => this.onKeyboardShow(e));
    }
  }

  onKeyboardShow(e) {
    let self = this;
    self.scrollToBottomPage();
  }

  scrollToBottomPage() {
    let self = this;
    setTimeout(() => {
      self.content.scrollToBottom();
    }, 150);
  }

  ionViewDidLoad() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded', 'ionViewDidLoad()');
    if (this.chatSummary) {
      this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded with chatSummary', 'ionViewDidLoad()');
      this.loadMessages();
    } else if (this.chatId) {
      this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Loaded with chatId', 'ionViewDidLoad()');
      this.lookupChatSummaryViaChatIdAndLoadMessages();
    } else {
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
        log.warn(`could not find chatSummary at ${chatSummaryRef.toString()}`);
      }
    });
  }

  lookupChatSummaryViaChatId() {
    let chatSummaryRef = firebase.database().ref(`/users/${this.auth.currentUserId}/chatSummaries/${this.chatId}`);
    chatSummaryRef.once('value', (snapshot) => {
      if (snapshot.exists()) {
        this.chatSummary = snapshot.val();
      } else {
        log.warn(`could not find chatSummary at ${chatSummaryRef.toString()}`);
      }
    });
  }

  adjustMessageTextAreaHeightBasedOnInput() {
    const MESSAGE_TEXT_AREA_MAXIMUM_HEIGHT = 115;
    const MESSAGE_TEXT_AREA_ROW_HEIGHT = 38;

    jQuery('textarea').on('input', event => {
      this.messageTextAreaHeight = Math.min(event.target.scrollHeight, MESSAGE_TEXT_AREA_MAXIMUM_HEIGHT);
      event.target.rows = Math.ceil(this.messageTextAreaHeight / MESSAGE_TEXT_AREA_ROW_HEIGHT);
    });
  }

  lookupChatSummaryViaContactAndLoadMessages() {
    let self = this;
    firebase.database().ref(`/users/${self.auth.currentUser.key}/chatSummaries`).once('value', (chatSummariesSnapshot) => {
      if (chatSummariesSnapshot.exists()) {
        let chatSummaries = chatSummariesSnapshot.val();
        self.chatId = _.findKey(chatSummaries, (chatSummary: any, chatId: string) => {
          return _.includes(_.keys(chatSummary.users), self.contact.userId);
        });
        if (self.chatId) {
          self.chatSummary = chatSummaries[self.chatId];
          self.loadMessages();
        }
      }
    });
    if (!self.chatSummary) {
      this.buildNewChatSummary();
    }
  }

  loadMessages() {
    if (!this.messagesRef || this.messagesRef.closed) {
      this.messagesRef = this.angularFire.database.list(`/users/${this.auth.currentUserId}/chats/${this.chatId}/messages`).subscribe(data => {
        this.messages = data;
        this.scrollToBottomPage();
      });
    }

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

  alertBlockedContact(isFirstMessageInChat) {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Show alert of blocked user', 'alertBlockedContact()');
    let alert = this.alertCtrl.create({
      message: this.translate.instant('chat.unblockMessage', { value: this.displayUser().name }),
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('chat.unblock'),
          handler: () => {
            alert.dismiss().then(() => {
              this.sendMessage(isFirstMessageInChat);
              this.setBlockContactInDB(false);
            });
          }
        }
      ]
    });
    return alert;
  }

  sendMessageClick() {
    if (!this.validateMessage()) {
      return;
    }
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Send message', 'sendMessageClick()');

    let isFirstMessageInChat = this.chatSummaryUnsaved();
    if (this.chatSummaryUnsaved()) {
      this.saveChatSummary();
    }
    if (this.chatSummary.blocked || false) {
      let alert = this.alertBlockedContact(isFirstMessageInChat);
      alert.present();
    } else {
      this.sendMessage(isFirstMessageInChat);
    }
  }

  sendMessage(isFirstMessageInChat) {
    // add message to list of messages for this chat
    let messagesRef = firebase.database().ref(`/users/${this.auth.currentUserId}/chats/${this.chatId}/messages`);
    let message = { text: this.messageText, sentAt: firebase.database.ServerValue.TIMESTAMP, senderUserId: this.auth.currentUserId };
    let messageRef = messagesRef.push(message);
    this.loadMessages();

    // copy the message to the 'lastMessage' field of the chat summary associated with this chat
    let chatSummaryRef = firebase.database().ref(`/users/${this.auth.currentUserId}/chatSummaries`).child(this.chatId);
    chatSummaryRef.child('lastMessage').update(_.merge(message, { messageId: messageRef.key }));

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
    let eventRef = firebase.database().ref(`/users/${this.auth.currentUserId}/events/${this.chatId}`);
    let messageSummary = this.messageText.length > 50 ? `${this.messageText.substring(0, 50)}...` : this.messageText;
    eventRef.set({
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      messageText: `${this.translate.instant('you')}: ${messageSummary}`,
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
    if (this.messagesRef && !this.messagesRef.closed) {
      this.messagesRef.unsubscribe();
    }
  }

  displayUser() {
    if (this.contact) {
      return this.contact;
    } else {
      return this.chatSummary ? this.chatSummary.users[this.chatSummary.displayUserId] : '';
    }
  }

  sender(message) {
    return this.chatSummary.users[message.senderUserId];
  }

  resetMessageTextArea() {
    this.messageText = '';
    this.messageTextAreaHeight = 32;
    jQuery('textarea')[0].rows = 1;
  }

  blockContact() {
    this.googleAnalyticsEventsService.emitEvent(this.pageName, 'Click on Block contact button', 'blockContact()');
    let alert = this.alertCtrl.create({
      message: this.translate.instant('chat.blockMessage', { value: this.displayUser().name }),
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('ok'),
          handler: () => {
            alert.dismiss().then(() => {
              if (this.chatSummaryUnsaved()) {
                this.saveChatSummary();
              }
              this.setBlockContactInDB(true);
            });
          }
        }
      ]
    });
    alert.present();
  }

  setBlockContactInDB(value: boolean) {
    firebase.database().ref(`/users/${this.auth.currentUserId}/chatSummaries/${this.chatId}`)
      .update({ blocked: value }).then(() => {
        this.lookupChatSummaryViaChatId();
      });
  }

  messageTextFocus() {
    let self = this;
    setTimeout(() => {
      self.scrollToBottomPage();
    }, 1000);
  }

  presentPopover(event) {
    let popover = this.popoverCtrl.create(PopoverChatPage);

    popover.present({ ev: event });

    popover.onDidDismiss(data => {
      if (data) {
        if (data.block) {
          this.blockContact();
        }
      }
    });
  }
}
