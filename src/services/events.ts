import {Injectable, EventEmitter, Inject} from '@angular/core';
import * as _ from 'lodash';
import { FirebaseApp } from 'angularfire2';
import {AuthService} from './auth';

@Injectable()
export class EventsService {
  events = [];
  eventChanged = new EventEmitter();

  constructor(private auth: AuthService, @Inject(FirebaseApp) firebase: any) {
    this.loadEvents();
  }

  loadEvents() {
    firebase.database().ref(`/users/${this.auth.currentUserId}/events/`)
      .on('child_added', snapshot => {
        this.events.push(snapshot.val());
        this.events = _.orderBy(_.values(this.events), ['updatedAt'], ['desc']);
        this.eventChanged.emit({});
      });

    firebase.database().ref(`/users/${this.auth.currentUserId}/events/`)
      .on('child_changed', snapshot => {
        let index = _.findIndex(this.events, _.pick(snapshot.val(), 'sourceId'));
        this.events.splice(index, 1, snapshot.val());
        this.events = _.orderBy(_.values(this.events), ['updatedAt'], ['desc']);
        this.eventChanged.emit({});
      });
  }
}
