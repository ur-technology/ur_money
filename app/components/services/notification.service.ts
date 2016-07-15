import { Injectable, Inject } from '@angular/core';
import '../rxjs-operators'
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {ChatUser} from '../models/chat-user';
import {ChatMessage} from '../models/chat-message'
import {LocalNotifications} from 'ionic-native';

@Injectable()
export class NotificationService {


    constructor(private angularFire: AngularFire) {

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

    readMessageNotifications(userId: string): FirebaseListObservable<any> {
        return this.angularFire.database.list(`/message-notifications`, {
            query: {
                orderByChild: "receiverUid",
                equalTo: userId
            }
        });
    }

    sendMessageNotifications(userId: string) {
        this.readMessageNotifications(userId).subscribe((data: any) => {
            if (data) {
                this.scheduleNotification(data, userId);
            }
        });
    }

    scheduleNotification(data: any, userId: string) {
        for (var i = 0; i < data.length; i++) {
            if (userId === data[i].receiverUid) {
                LocalNotifications.schedule({
                    id: data[i].$key,
                    text: `${data[i].senderName}: ${data[i].text}`,
                    icon: data[i].profilePhotoUrl
                });
                this.deleteMessageNotification(data[i].$key);
            }
        }
    }

    deleteMessageNotification(messageNotificationId: string) {
        this.angularFire.database.object(`/message-notifications/${messageNotificationId}`).remove();
    }

}
