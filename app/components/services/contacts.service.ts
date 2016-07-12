import { Injectable, Inject } from '@angular/core';
import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {Contact} from '../models/contact';
import '../rxjs-operators'
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ContactsService {

    constructor(private angularFire: AngularFire) {

    }

    getContacts(): Observable<Array<Contact>> {      
        let contacts: Array<Contact> = [];
        return this.angularFire.database.list(`/users`).map((data: any) => {
            contacts = data;
            return contacts;
        });
    }

    getContactById(userId: string): Observable<Contact> {
        let contact: Contact;
        return this.angularFire.database.object(`/users/${userId}`).map(data => {
            if (data) {
                contact = data;
            }
            return contact;
        });
    }


}
