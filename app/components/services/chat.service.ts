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

    addChatSummaryToUser(userIdToUpdate: string, otherUser: ChatUser, message: ChatMessage) {
        this.angularFire.database.object(`/users/${userIdToUpdate}/myChatSummaries`)
            .set({ otherUser: otherUser, lastMessage: message });
    }
}
