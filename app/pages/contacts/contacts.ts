import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {ContactsService} from '../../components/services/contacts.service';
import {Contact} from '../../components/models/contact';
import {ChatPage} from '../chat/chat';
import {Auth} from '../../components/auth/auth';
import {Subscription} from 'rxjs';
import * as _ from 'lodash';

@Component({
    templateUrl: 'build/pages/contacts/contacts.html',
    providers: [ContactsService]
})
export class ContactsPage {
    userId: string;
    contacts: Array<Contact> = [];
    chats: Array<any>;

    constructor(private nav: NavController, private contactsService: ContactsService, auth: Auth) {
        this.contacts = [];
        this.userId = auth.uid;
        this.getContactsList();

    }

    getContactsList() {
        let subscriptionContacts = this.contactsService.getContacts().subscribe(data => {
            this.contacts = data;
            if (subscriptionContacts && !subscriptionContacts.isUnsubscribed) {
                subscriptionContacts.unsubscribe();
            }
        });
    }

    gotoChat(contact: Contact) {        
        this.nav.push(ChatPage, { userId: this.userId, contact: contact }, { animate: true, direction: 'forward' });
    }
}
