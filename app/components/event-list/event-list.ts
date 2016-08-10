import { Component } from '@angular/core';
import { NavController, Platform} from 'ionic-angular';
import { Toast} from 'ionic-native';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable, AuthMethods} from 'angularfire2'
import * as _ from 'lodash';
import {Timestamp}  from '../../pipes/timestamp';
import * as moment from 'moment';
import {DateAndTime} from '../../pipes/dateAndTime.pipe';
import {EventsService} from '../../services/events';
import {ChatPage} from '../../pages/chat/chat';
import {LocalNotifications} from 'ionic-native';
import {AuthService} from '../../services/auth';

@Component({
  selector: 'events-list',
  templateUrl: 'build/components/event-list/event-list.html',
  pipes: [DateAndTime]
})
export class EventListComponent {
  constructor(private eventsService: EventsService, private nav: NavController, private platform: Platform, private auth: AuthService) {
    console.log("EventListComponent constructor");
    this.processChatNotification();
    this.listenForNotificationSelection();
  }

  ngOnInit() {
    this.eventsService.loadEvents();
  }

  listenForNotificationSelection() {
    LocalNotifications.on("click", (notification, state) => {
      let data = JSON.parse(notification.data);
      this.openPageByEventType(data.sourceType, data.sourceId);
    });
  }

  processChatNotification() {
    firebase.database().ref(`/users/${this.auth.currentUserId}/events`)
      .orderByChild("notificationProcessed")
      .equalTo("false")
      .on('child_added', notificationTaskSnapshot => {
        let event = notificationTaskSnapshot.val();
        LocalNotifications.schedule({
          id: Math.floor(Math.random() * 3000) + 1,
          text: `${event.title}`,
          icon: 'res://icon',
          smallIcon: 'stat_notify_chat',
          sound: this._returnSoundNotificationByEventType(event.sourceType),
          data: { sourceId: event.sourceId, sourceType: event.sourceType }
        });
        notificationTaskSnapshot.ref.update({ notificationProcessed: "true" });
      });
  }

  private _returnSoundNotificationByEventType(type: string) {
    let sound: string = "";
    switch (type) {
      case 'message':
        sound = `file://sounds/${this.platform.is('android') ? 'messageSound.mp3' : 'messageSound.m4r'}`
        break;
      case 'transaction':
        sound = `file://sounds/${this.platform.is('android') ? 'transactionSound.mp3' : 'transactionSound.m4r'}`
        break;
    }
    return sound;
  }


  openPageByEventType(sourceType: string, sourceId: string) {
    if (sourceType === "message") {
      this.nav.rootNav.push(ChatPage, { chatId: sourceId }, { animate: true, direction: 'forward' });
    }
    else if (sourceType === "transaction") {
      Toast.show("Not implemented yet. It should open the transaction page", '5000', 'bottom').subscribe(
        toast => {
        }
      );
    }
  }

}
