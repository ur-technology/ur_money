import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {ContactsService} from '../../components/services/contacts.service';
import {Contact} from '../../components/models/contact';
import {ChatPage} from '../chat/chat';
import {Auth} from '../../components/auth/auth';
import {Subscription} from 'rxjs';
import * as _ from 'lodash';
import {ChatUser} from '../../components/models/chat-user';

@Component({
    templateUrl: 'build/pages/contacts/contacts.html',
    providers: [ContactsService]
})
export class ContactsPage {
    userId: string;
    contacts: Array<Contact> = [];
    chats: Array<any>;
    currentUser: Contact;

    constructor(private nav: NavController, private contactsService: ContactsService, auth: Auth) {
        this.contacts = [];
        this.userId = auth.uid;
        this.getContactsList();

    }
    loadCurrentUser() {
        let subscriptionContacts: Subscription = this.contactsService.getContactById(this.userId).subscribe(data => {
            this.currentUser = data;
            if (subscriptionContacts && !subscriptionContacts.isUnsubscribed) {
                subscriptionContacts.unsubscribe();
            }
        });
    }

    getContactsList() {
        let subscriptionContacts: Subscription = this.contactsService.getContacts().subscribe(data => {
            this.contacts = data;
            if (subscriptionContacts && !subscriptionContacts.isUnsubscribed) {
                subscriptionContacts.unsubscribe();
            }
        });
    }

    gotoChat(contact: Contact) {
        let chatUser2: ChatUser;
        chatUser2.firstName = contact.firstName;
        chatUser2.lastName = contact.lastName;
        chatUser2.profilePhotoUrl = contact.profilePhotoUrl;

        let chatUser1: ChatUser = this.currentUser;

        this.nav.push(ChatPage, { user: chatUser1, contact: chatUser2 }, { animate: true, direction: 'forward' });
    }
}
