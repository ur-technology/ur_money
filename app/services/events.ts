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
  }

  loadEvents() {
    firebase.database().ref(`/users/${this.auth.currentUserId}/events/`)
      .on("value", snapshot => {
        this.events = _.values(snapshot.val());
      });
  }
}
