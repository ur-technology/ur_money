import {Injectable, EventEmitter, Inject} from '@angular/core';
import * as _ from 'lodash';
import { FirebaseApp } from 'angularfire2';
import {AuthService} from './auth';

@Injectable()
export class EventsService {
  events = [];
  eventChanged = new EventEmitter();

  constructor(private auth: AuthService, @Inject(FirebaseApp) firebase: any) {
  }

  loadEvents() {
    this.events = [];
    firebase.database().ref(`/users/${this.auth.currentUserId}/events/`).orderByChild('updatedAt').limitToLast(50)
      .on('child_added', snapshot => {
        if (snapshot.exists()) {
          let index = _.findIndex(this.events, _.pick(snapshot.val(), 'sourceId'));
          if (index === -1) {
            this.events.push(snapshot.val());
            this.events = _.orderBy(_.values(this.events), ['updatedAt'], ['desc']);
            this.eventChanged.emit({});
          }
        }
      });

    firebase.database().ref(`/users/${this.auth.currentUserId}/events/`)
    .on('child_changed', snapshot => {
        if (snapshot.exists()) {
          let index = _.findIndex(this.events, _.pick(snapshot.val(), 'sourceId'));
          this.events.splice(index, 1, snapshot.val());
          this.events = _.orderBy(_.values(this.events), ['updatedAt'], ['desc']);
          this.eventChanged.emit({});
        }
      });
  }
}
