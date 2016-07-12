import { Injectable, Inject } from '@angular/core';
import '../rxjs-operators'
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {Chat} from '../models/chat';
import {ChatUser} from '../models/chat-user';
import {ChatMessage} from '../models/chat-message'

@Injectable()
export class ChatService {

    constructor(private angularFire: AngularFire) {

    }


    createChat(user, contact) {
        let chat = new Chat();
        chat.createdAt = firebase.database.ServerValue.TIMESTAMP;
        let chatRef = this.angularFire.database.list('/chats').push(chat);
        this.addUsersToChat(user, chatRef);
        this.addUsersToChat(contact, chatRef);

        return chatRef.key;
    }

    addUsersToChat(user, chatRef) {
        chatRef.child('/users').push(user);
    }

    addMessageToChat(chatId: string, chatMessage: ChatMessage) {
        this.angularFire.database.list(`/chats/${chatId}/messages`).push(chatMessage);
    }

    addChatSummaryToUser(userIdToUpdate: string, otherUser: ChatUser, message: ChatMessage, chatId: string) {
        let chatRef = this.angularFire.database.list(`/users/${userIdToUpdate}/myChatSummaries`, {
            query: {
                orderByChild: "chatId",
                equalTo: chatId
            }
        }).subscribe((data: any) => {
            if (chatRef && !chatRef.isUnsubscribed) {
                chatRef.unsubscribe();
                if (data.length > 0) {
                    this.updateMyChatSummary(userIdToUpdate, data[0].$key, otherUser, message, chatId)
                } else {
                    this.angularFire.database.list(`/users/${userIdToUpdate}/myChatSummaries`).push({ chatId: chatId, otherUser: otherUser, lastMessage: message });
                }
            }
        });

    }

    updateMyChatSummary(userIdToUpdate: string, chatSummaryId: string, otherUser: ChatUser, message: ChatMessage, chatId: string) {
        this.angularFire.database.object(`/users/${userIdToUpdate}/myChatSummaries/${chatSummaryId}`)
            .set({ chatId: chatId, otherUser: otherUser, lastMessage: message });
    }

    getChatMessages(chatId: string) {
        return this.angularFire.database.list(`/chats/${chatId}/messages`);
    }

    getChatSummaries(userId: string) {
        console.log(`/users/${userId}/myChatSummaries`);
        return this.angularFire.database.list(`/users/${userId}/myChatSummaries`);
    }

    findChatId(user1: ChatUser, user2: ChatUser) {
        return new Promise((resolve) => {
            let chatRef = this.angularFire.database.list(`/users/${user1.userUid}/myChatSummaries`).subscribe(data => {
                if (chatRef && !chatRef.isUnsubscribed) {
                    chatRef.unsubscribe();
                    let found: boolean = false;
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
