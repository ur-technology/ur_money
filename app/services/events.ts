import {Injectable, Inject, ViewChild} from '@angular/core'
import {Nav, Platform} from 'ionic-angular';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable, AuthMethods} from 'angularfire2'
import * as _ from 'lodash';
import * as log from 'loglevel';
import {Subscription} from 'rxjs';
import {LocalNotifications} from 'ionic-native';
import {AuthService} from './auth';

@Injectable()
export class EventsService {
  events = [];

  constructor(private auth: AuthService) {
    this.loadEvents();
  }

  loadEvents() {
    firebase.database().ref(`/users/${this.auth.currentUserId}/events/`)
      .on("child_added", snapshot => {
        this.events.push(snapshot.val());
        this.events = _.orderBy(_.values(this.events), ['updatedAt'], ['desc']);
      });

    firebase.database().ref(`/users/${this.auth.currentUserId}/events/`)
      .on("child_changed", snapshot => {
        let index = _.findIndex(this.events, _.pick(snapshot.val(), 'sourceId'));
        this.events.splice(index, 1, snapshot.val());
        this.events = _.orderBy(_.values(this.events), ['updatedAt'], ['desc']);        
      });
  }
}
