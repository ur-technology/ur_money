import { Component } from '@angular/core';
import { NavController, Platform, ToastController } from 'ionic-angular';
import * as firebase from 'firebase';
import { App } from 'ionic-angular';
import { EventsService } from '../../services/events.service';
import { ChatPage } from '../../pages/chat/chat';
import { TransactionsPage } from '../../pages/transactions/transactions';
import { LocalNotifications } from 'ionic-native';
import { AuthService } from '../../services/auth';
import { GoogleAnalyticsEventsService } from '../../services/google-analytics-events.service';
import * as _ from 'lodash';

@Component({
  selector: 'events-list',
  templateUrl: 'event-list.html',
})
export class EventListComponent {
  events = [];
  pageName = 'EventListComponent';

  constructor(public eventsService: EventsService, public nav: NavController, public platform: Platform, public auth: AuthService, public toastCtrl: ToastController, public app: App,
    private googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    if (platform.is('cordova')) {
      this.listenForNewEvents();
      this.listenForNotificationSelection();
    }

    this.eventsService.loadEvents();

    this.eventsService.eventChanged.subscribe(() => {
      this.events = this.eventsService.events;
    });
    this.events = this.eventsService.events;
  }

  ngOnInit() {
  }

  listenForNotificationSelection() {
    LocalNotifications.on('click', (notification, state) => {
      let data = JSON.parse(notification.data);
      this.googleAnalyticsEventsService.emitEvent(this.pageName, `Clicked in a notification - ${data.sourceType}`, 'listenForNotificationSelection()');
      this.openPageByEventType(data.sourceType, data.sourceId);
    });
  }

  listenForNewEvents() {
    let self = this;
    firebase.database().ref(`/users/${self.auth.currentUserId}/events`)
      .orderByChild('notificationProcessed')
      .equalTo(false)
      .on('child_added', eventSnapshot => {
        if (eventSnapshot.val()) {
          let event = eventSnapshot.val();
          let obj: any = {
            id: event.sourceType === 'message' ? 1 : 2,
            text: `${event.title}: ${event.messageText}`,
            icon: 'res://icon',
            smallIcon: 'stat_notify_chat',
            sound: self._soundFile(event.sourceType),
            data: { sourceId: event.sourceId, sourceType: event.sourceType }
          };
          LocalNotifications.isPresent(obj.id).then(present => {
            self.processNotificationEvent(present, obj, event.sourceType);
            eventSnapshot.ref.update({ notificationProcessed: true });
          });
        }
      });
  }

  private processNotificationEvent(present, obj, sourceType) {
    let self = this;

    if (!present) {
      obj.at = new Date(new Date().getTime() + 900 * 1000);
    } else {
      obj.text = sourceType === 'message' ? "You have new chats" : "You have new transactions";
      obj.data.sourceId = undefined;
    }

    self.scheduleNotification(obj, sourceType, present);
  }

  private scheduleNotification(obj, sourceType, present) {
    let self = this;
    let chatNotificationsEnabled = self.auth.currentUser.notifications && self.auth.currentUser.notifications.chatNotificationsEnabled;
    chatNotificationsEnabled = _.isUndefined(chatNotificationsEnabled) ? true : chatNotificationsEnabled;
    let transactionNotificationsEnabled = self.auth.currentUser.notifications && self.auth.currentUser.notifications.transactionNotificationsEnabled;
    transactionNotificationsEnabled = _.isUndefined(transactionNotificationsEnabled) ? true : transactionNotificationsEnabled;
    let sendNotification = sourceType === 'message' ? chatNotificationsEnabled : transactionNotificationsEnabled;

    if (sendNotification) {
      present ? LocalNotifications.update(obj) : LocalNotifications.schedule(obj);
    }
  }

  private _soundFile(type: string) {
    let baseName = type === 'transaction' ? 'transactionSound' : 'messageSound';
    return `file://sounds/${baseName}.${this.platform.is('android') ? 'mp3' : 'm4r'}`;
  }

  openPageByEventType(sourceType: string, sourceId: string) {
    if (sourceType === 'message') {
      if (sourceId) {
        this.googleAnalyticsEventsService.emitEvent(this.pageName, `Clicked a event. Going to chat page`, 'openPageByEventType()');
        this.app.getRootNav().push(ChatPage, { chatId: sourceId });
      }
    } else if (sourceType === 'transaction') {
      this.googleAnalyticsEventsService.emitEvent(this.pageName, `Clicked a event. Going to transactions page`, 'openPageByEventType()');
      this.app.getRootNav().push(TransactionsPage, {});
    }
  }

}
