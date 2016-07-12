import { Injectable, Inject } from '@angular/core';
import '../rxjs-operators'
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {Chat} from '../models/chat';

@Injectable()
export class ChatService {

    constructor(private angularFire: AngularFire) {

    }


    createChat(): string {
        console.log("createChat");
        let chat = new Chat();
        chat.createdAt = firebase.database.ServerValue.TIMESTAMP
        let chatRef = this.angularFire.database.list('/chats').push(chat);
        return chatRef.key;
    }

}
