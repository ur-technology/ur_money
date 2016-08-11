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
    this.listenForNewEvents();
    this.listenForNotificationSelection();
  }

  ngOnInit() {
  }

  listenForNotificationSelection() {
    LocalNotifications.on("click", (notification, state) => {
      let data = JSON.parse(notification.data);
      this.openPageByEventType(data.sourceType, data.sourceId);
    });
  }

  listenForNewEvents() {
    firebase.database().ref(`/users/${this.auth.currentUserId}/events`)
      .orderByChild("notificationProcessed")
      .equalTo("false")
      .on('child_added', eventSnapshot  => {
        let event = eventSnapshot.val();
        LocalNotifications.schedule({
          id: Math.floor(Math.random() * 3000) + 1,
          text: `${event.title}: ${event.messageText}`,
          icon: 'res://icon',
          smallIcon: 'stat_notify_chat',
          sound: this._soundFile(event.sourceType),
          data: { sourceId: event.sourceId, sourceType: event.sourceType }
        });
        eventSnapshot.ref.update({ notificationProcessed: "true" });
      });
  }

  private _soundFile(type: string) {
    let baseName = type === 'transaction' ? 'transactionSound' : 'messageSound';
    return `file://sounds/${baseName}.${this.platform.is('android') ? 'mp3' : 'm4r'}`;
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
