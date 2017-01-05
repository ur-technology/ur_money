import { Component, Inject} from '@angular/core';
import { NavController, Platform, ToastController} from 'ionic-angular';
import { FirebaseApp } from 'angularfire2';
import { App } from 'ionic-angular';
import {EventsService} from '../../services/events';
import {ChatPage} from '../../pages/chat/chat';
import {TransactionsPage} from '../../pages/transactions/transactions';
import {LocalNotifications} from 'ionic-native';
import {AuthService} from '../../services/auth';
import {TranslateService} from 'ng2-translate/ng2-translate';
import * as _ from 'lodash';

@Component({
  selector: 'events-list',
  templateUrl: 'event-list.html',
})
export class EventListComponent {
  events = [];
  constructor(public eventsService: EventsService, public nav: NavController, public platform: Platform, public auth: AuthService, public toastCtrl: ToastController, public app: App, @Inject(FirebaseApp) firebase: any, public translate: TranslateService) {
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
      obj.at = new Date(new Date().getTime() + 30 * 1000);
    } else {
      obj.text = sourceType === 'message' ? self.translate.instant('home.newChats') : self.translate.instant('home.newTransactions');
      obj.data.sourceId = undefined;
    }

    self.scheduleNotification(obj, sourceType, present);
  }

  private scheduleNotification(obj, sourceType, present) {
    let self = this;
    let chatNotificationsEnabled: boolean = self.auth.currentUser.settings && self.auth.currentUser.settings.chatNotifications;
    chatNotificationsEnabled = _.isUndefined(chatNotificationsEnabled) ? true : chatNotificationsEnabled;
    let transactionNotificationsEnabled: boolean = self.auth.currentUser.settings && self.auth.currentUser.settings.transactionNotifications;
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
        this.app.getRootNav().push(ChatPage, { chatId: sourceId });
      }
    } else if (sourceType === 'transaction') {
      this.app.getRootNav().push(TransactionsPage, {});
    }
  }

}
