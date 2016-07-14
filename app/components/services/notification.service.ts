import { Injectable, Inject } from '@angular/core';
import '../rxjs-operators'
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {ChatUser} from '../models/chat-user';
import {ChatMessage} from '../models/chat-message'
import {Auth} from '../../components/auth/auth';
import {LocalNotifications} from 'ionic-native';

@Injectable()
export class NotificationService {
    userId: string;

    constructor(private angularFire: AngularFire, auth: Auth) {
        this.userId = auth.uid;
    }

    saveNotification(chatId: string, receiverUid: string, sender: ChatUser, chatMessage: ChatMessage) {
        this.angularFire.database.list(`/message-notifications`).push({
            receiverUid: receiverUid,
            senderName: `${sender.firstName} ${sender.lastName}`,
            profilePhotoUrl: sender.profilePhotoUrl ? sender.profilePhotoUrl : "",
            text: chatMessage.text,
            chatId: chatId
        });
    }

    readMessageNotifications(): FirebaseListObservable<any> {
        return this.angularFire.database.list(`/message-notifications`, {
            query: {
                orderByChild: "receiverUid",
                equalTo: this.userId
            }
        });
    }

    sendMessageNotifications() {
        this.readMessageNotifications().subscribe((data: any) => {
            console.log("notificaion", data);
            LocalNotifications.schedule({
                id: data.$key,
                text: data.text
            });

            this.deleteMessageNotification(data.$key);
        });
    }

    deleteMessageNotification(messageNotificationId: string) {
        console.log("va a borrar notificaion", messageNotificationId);
        this.angularFire.database.object(`/message-notifications/${messageNotificationId}`).remove();
    }

}
