import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {ChatPage} from '../chat/chat';
import {Auth} from '../../components/auth/auth';
import {Subscription} from 'rxjs';
import * as _ from 'lodash';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';

@Component({
  templateUrl: 'build/pages/contacts/contacts.html'
})
export class ContactsPage {
  contacts: Array<any> = [];
  chats: Array<any>;
  currentUser: any;

  constructor(private nav: NavController, auth: Auth, private angularFire: AngularFire) {
    this.contacts = [];
    this.currentUser = auth.userObject;
  }
  ionViewLoaded() {
    this.getContactsList();
  }

  getContactsList() {
    let subscriptionContacts: Subscription = this.angularFire.database.list(`/users`).subscribe(data => {
      this.contacts = data;
      if (subscriptionContacts && !subscriptionContacts.isUnsubscribed) {
        subscriptionContacts.unsubscribe();
      }
    });
  }

  gotoChat(contact: any) {
    this.nav.rootNav.push(ChatPage, { user: this.getChatUser(this.currentUser), contact: this.getChatUser(contact) }, { animate: true, direction: 'forward' });
  }

  getChatUser(object: any): any {
    return { firstName: object.firstName, lastName: object.lastName, userUid: object.$key, profilePhotoUrl: object.profilePhotoUrl ? object.profilePhotoUrl : "" };
  }
}
