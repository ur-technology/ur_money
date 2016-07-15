import { Injectable, Inject } from '@angular/core';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {User} from '../models/user';
import '../rxjs-operators'
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ContactsService {
    contacts: Array<User> = [];
    constructor(private angularFire: AngularFire) {

    }

    getContacts(): Observable<Array<User>> {
        if (this.contacts && this.contacts.length > 0) {
            return Observable.create(observer => {
                observer.next(this.contacts);
                //  observer.complete();
            });
        } else {
            return this.angularFire.database.list(`/users`).map((data: any) => {
                this.contacts = data;
                return this.contacts;
            });
        }
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
