import { Injectable, Inject } from '@angular/core';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {User} from '../models/user';
import '../rxjs-operators'
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ContactsService {

    constructor(private angularFire: AngularFire) {

    }

    getContacts(): Observable<Array<User>> {
        let contacts: Array<User> = [];
        return this.angularFire.database.list(`/users`).map((data: any) => {
            contacts = data;
            return contacts;
        });
    }

    getContactById(userId: string): Observable<User> {
        let contact: User;
        return this.angularFire.database.object(`/users/${userId}`).map(data => {
            if (data) {
                contact = data;
            }
            return contact;
        });
    }


}
