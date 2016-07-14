import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {ContactsService} from '../../components/services/contacts.service';
import {User} from '../../components/models/user';
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
    contacts: Array<User> = [];
    chats: Array<any>;
    currentUser: User;

    constructor(private nav: NavController, private contactsService: ContactsService, auth: Auth) {
        this.contacts = [];
        this.userId = auth.uid;
    }
    ionViewLoaded() {
        this.getContactsList();
        this.loadCurrentUser();        
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

    gotoChat(contact: User) {
        let chatUser2: ChatUser = this.getChatUser(contact);
        let chatUser1: ChatUser = this.getChatUser(this.currentUser);

        this.nav.rootNav.push(ChatPage, { user: chatUser1, contact: chatUser2 }, { animate: true, direction: 'forward' });

    }

    getChatUser(object: any): ChatUser {
        let chatUser: ChatUser = new ChatUser();
        chatUser.firstName = object.firstName;
        chatUser.lastName = object.lastName;
        chatUser.userUid = object.$key;
        chatUser.profilePhotoUrl = object.profilePhotoUrl ? object.profilePhotoUrl : "";
        return chatUser;
    }
}
