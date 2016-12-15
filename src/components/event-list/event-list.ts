import { Component, NgZone} from '@angular/core';
import { NavController, Platform, ToastController} from 'ionic-angular';
import * as firebase from 'firebase';
import { App } from 'ionic-angular';
import {DateAndTime} from '../../pipes/dateAndTime.pipe';
import {EventsService} from '../../services/events';
import {ChatPage} from '../../pages/chat/chat';
import {TransactionsPage} from '../../pages/transactions/transactions';
import {LocalNotifications} from 'ionic-native';
import {AuthService} from '../../services/auth';

@Component({
  selector: 'events-list',
  templateUrl: 'build/components/event-list/event-list.html',
  pipes: [DateAndTime]
})
export class EventListComponent {
  events = [];
  constructor(private eventsService: EventsService, private nav: NavController, private platform: Platform, private auth: AuthService, private toastCtrl: ToastController, private app: App, private ngZone: NgZone) {
    if (platform.is('cordova')) {
      this.listenForNewEvents();
      this.listenForNotificationSelection();
    }

    this.eventsService.eventChanged.subscribe(() => {
      this.ngZone.run(() => {
        this.events = this.eventsService.events;
      });
    });
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
    firebase.database().ref(`/users/${this.auth.currentUserId}/events`)
      .orderByChild('notificationProcessed')
      .equalTo(false)
      .on('child_added', eventSnapshot => {
        let event = eventSnapshot.val();
        let obj = {
          id: this.getUniqueInteger(event.sourceId),
          text: `${event.title}: ${event.messageText}`,
          icon: 'res://icon',
          smallIcon: 'stat_notify_chat',
          sound: this._soundFile(event.sourceType),
          data: { sourceId: event.sourceId, sourceType: event.sourceType }
        };
        LocalNotifications.isPresent(obj.id).then(present => {
          if (!present) {
            LocalNotifications.schedule(obj);
            eventSnapshot.ref.update({ notificationProcessed: true });
          } else {
            LocalNotifications.clear(obj.id).then(() => {
              LocalNotifications.schedule(obj);
              eventSnapshot.ref.update({ notificationProcessed: true });
            });
          }
        });
      });
  }

  private _soundFile(type: string) {
    let baseName = type === 'transaction' ? 'transactionSound' : 'messageSound';
    return `file://sounds/${baseName}.${this.platform.is('android') ? 'mp3' : 'm4r'}`;
  }

  openPageByEventType(sourceType: string, sourceId: string) {
    if (sourceType === 'message') {
      this.app.getRootNav().push(ChatPage, { chatId: sourceId }, { animate: true, direction: 'forward' });
    } else if (sourceType === 'transaction') {
      this.app.getRootNav().push(TransactionsPage, {}, { animate: true, direction: 'forward' });
    }
  }

  getUniqueInteger(varString: string) {
    let hash = 0, i, chr, len;
    if (varString.length === 0) return hash;
    for (i = 0, len = varString.length; i < len; i++) {
      chr = varString.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }


}
