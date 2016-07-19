import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import {ChatsPage} from '../chats/chats';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {Subscription} from 'rxjs';
import {Timestamp}  from '../../pipes/timestamp';
import * as _ from 'underscore';


@Component({
  templateUrl: 'build/pages/chat/chat.html',
  pipes: [Timestamp]
})
export class ChatPage {
  tabBarElement: any;
  messages: any[];
  user: any;
  contactFullname: string;
  contact: any;
  messageText: string;
  chat: any;
  chatId: string;
  messagesRef: Subscription;
  @ViewChild(Content) content: Content;

  constructor(private nav: NavController, public navParams: NavParams, private angularFire: AngularFire) {
    this.tabBarElement = document.querySelector('ion-tabbar-section');
    this.user = this.navParams.get('user');
    this.contact = this.navParams.get('contact');
    this.chatId = this.navParams.get('chatId');
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 200);
  }

  ionViewLoaded() {
    this.findChatAndLoadMessages();
  }

  findChatAndLoadMessages() {
    if (this.chatId) {
      this.loadMessages();
    }
    else {
      this.findChatId(this.user, this.contact).then((chatId: string) => {
        this.chatId = chatId;
        this.loadMessages();

      });
    }
  }

  loadMessages() {
    this.messagesRef = this.angularFire.database.list(`/chats/${this.chatId}/messages`).subscribe(data => {
      this.messages = data;
      this.scrollToBottom();
    });
  }

  messageNotFromMe(message: any) {
    return message.senderUid !== this.user.userUid;
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

    this.createChat();
    let chatMessage = this.createChatMessageObject();
    this.addMessageToChat(this.chatId, chatMessage);
    this.addChatSummaryToUser(this.user.userUid, this.contact, chatMessage, this.chatId);
    this.addChatSummaryToUser(this.contact.userUid, this.user, chatMessage, this.chatId);
    this.saveNotification(this.chatId, this.contact.userUid, this.user, chatMessage);
    this.messageText = "";

  }

  saveNotification(chatId: string, receiverUid: string, sender: any, chatMessage: any) {
    this.angularFire.database.list(`/notifications`).push({
      receiverUid: receiverUid,
      senderName: `${sender.firstName} ${sender.lastName}`,
      profilePhotoUrl: sender.profilePhotoUrl ? sender.profilePhotoUrl : "",
      text: chatMessage.text,
      chatId: chatId
    });
  }

  addChatSummaryToUser(userIdToUpdate: string, otherUser: any, message: any, chatId: string) {
    console.log(`/users/${userIdToUpdate}/chatSummaries/${chatId}`);
    let chatRef = this.angularFire.database.list(`/users/${userIdToUpdate}/chatSummaries/${chatId}`).subscribe((data: any) => {
      if (chatRef && !chatRef.isUnsubscribed) {
        chatRef.unsubscribe();
        this.angularFire.database.object(`/users/${userIdToUpdate}/chatSummaries/${chatId}`).set({ otherUser: otherUser, lastMessage: message });
      }
    });
  }

  addChatSummaryToUser2(userIdToUpdate: string, otherUser: any, message: any, chatId: string) {
    console.log(`/users/${userIdToUpdate}/chatSummaries/${chatId}`);
    let chatRef = this.angularFire.database.list(`/users/${userIdToUpdate}/chatSummaries/${chatId}`).subscribe((data: any) => {
      if (chatRef && !chatRef.isUnsubscribed) {
        chatRef.unsubscribe();
        if (data.length > 0) {
          console.log("update summary", data);
          this.updateMyChatSummary(userIdToUpdate, chatId, otherUser, message);
        } else {
          console.log("create summary", chatId);
          this.angularFire.database.object(`/users/${userIdToUpdate}/chatSummaries/${chatId}`).set({ otherUser: otherUser, lastMessage: message });
        }
      }
    });

  }

  updateMyChatSummary(userIdToUpdate: string, chatId: string, otherUser: any, message: any) {
    this.angularFire.database.object(`/users/${userIdToUpdate}/chatSummaries/${chatId}`)
      .set({ otherUser: otherUser, lastMessage: message });
  }

  addMessageToChat(chatId: string, chatMessage: any) {
    this.angularFire.database.list(`/chats/${chatId}/messages`).push(chatMessage);
  }


  createChatMessageObject() {
    let chatMessage: any = new Object();
    chatMessage.text = this.messageText;
    chatMessage.sentAt = firebase.database.ServerValue.TIMESTAMP;
    chatMessage.senderUid = this.user.userUid;
    chatMessage.senderProfilePhotoUrl = this.user.profilePhotoUrl;
    return chatMessage;
  }

  createChat() {
    if (!this.chatId) {
      this.chatId = this.saveChat(this.user, this.contact);
      this.loadMessages();
    }
  }


  ionViewWillLeave() {
    if (this.messagesRef && !this.messagesRef.isUnsubscribed) {
      this.messagesRef.unsubscribe();
    }
  }

  saveChat(user, contact) {
    let chat: any = new Object();
    chat.createdAt = firebase.database.ServerValue.TIMESTAMP;
    let chatRef = this.angularFire.database.list('/chats').push(chat);
    this.addUsersToChat(user, chatRef);
    this.addUsersToChat(contact, chatRef);

    return chatRef.key;
  }
  addUsersToChat(user, chatRef) {
    chatRef.child('/users').push(user);
  }


  findChatId(user1: any, user2: any) {
    return new Promise((resolve) => {
      let chatRef = this.angularFire.database.list(`/users/${user1.userUid}/chatSummaries`).subscribe(data => {
        if (chatRef && !chatRef.isUnsubscribed) {
          chatRef.unsubscribe();
          for (var i = 0; i < data.length; i++) {
            let chatId = data[i].chatId;
            let userRef = this.angularFire.database.list(`/chats/${chatId}/users/`, {
              query: {
                orderByChild: "userUid",
                equalTo: user2.userUid
              }
            })
              .subscribe(userdata => {
                if (userRef && !userRef.isUnsubscribed) {
                  userRef.unsubscribe();
                  if (userdata.length > 0) {
                    resolve(chatId);
                  }
                }
              });
          }
        }
      });
    });
  }
}
