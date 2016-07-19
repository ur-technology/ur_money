import { Injectable } from '@angular/core';
import {NativeContactsService} from './native-contact.service';
import {ContactsService} from './contacts.service';
import {Subscription} from 'rxjs';
import * as lodash from 'lodash';
import libphonenumber = require('google-libphonenumber');
const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
const PNF = libphonenumber.PhoneNumberFormat;

@Injectable()
export class InviteContactsService {
  userOnApp = [];
  isUserLoaded = false;
  isDeviceContactsLoaded = false;
  contacts = [];
  contactsStore = [];
  intviteContacts = [];
  deviceContacts = [];

  constructor(private nativeContactService: NativeContactsService,
    private contactsService: ContactsService) {
    this.populateContacts();
  }

  populateContacts() {
    this.getUserList();
    this.nativeContactService.getDeviceContacts().then((data: Array<any>) => {
      //console.log(data);
      this.deviceContacts = lodash.sortBy(lodash.map(data, function (contact) {
        if (contact.name && contact.name.formatted) {
          contact.displayName = contact.name.formatted;
        }
        return contact;
      }), 'displayName');
      this.isDeviceContactsLoaded = true;
      this.createContactList();
    });
  }

  getUserList() {
    let subscriptionContacts: Subscription = this.contactsService.getAppContacts().subscribe(data => {
      this.userOnApp = data;
      this.isUserLoaded = true;
      this.createContactList();
      // console.log(data);
      if (subscriptionContacts && !subscriptionContacts.isUnsubscribed) {
        subscriptionContacts.unsubscribe();
      }
    });
  }


  createContactList() {
    if (this.isUserLoaded && this.isDeviceContactsLoaded) {
      let registerUserContactNumbers = [];
      lodash.each(this.userOnApp, (user) => {
        registerUserContactNumbers.push(this.phoneNumberWithoutCountryCode(user.phone));
      });

      lodash.each(this.deviceContacts, (contact) => {
        if (this.isPhoneNumberExistInContact(contact)) {
          let inviteContacts = {
            name: contact.name && contact.name.formatted ? contact.name.formatted : 'Unknown',
            imgID: contact.photos ? lodash.first(contact.photos) : null,
            email: lodash.first(contact.emails),
            phone: lodash.first(contact.phoneNumbers),
            newUser: true,
            id: contact.id
          };
          if (this.isPhoneMatchWithContact(contact, registerUserContactNumbers)) {
            inviteContacts.newUser = false;
            this.addContactToContactsList(inviteContacts);
          } else {
            this.addContactToContactsList(inviteContacts);
          }
        }
      });

    }
  }

  getContactsLength() {
    return this.contacts.length + this.contactsStore.length;
  }

  getNextContacts(pageNumber, size) {
    let offset = pageNumber * size;
    let nextContatcs = lodash.take(lodash.drop(this.contactsStore, offset), size);
    return nextContatcs;
  }


  addContactToContactsList(contact) {
    if (this.contacts.length < 20) {
      this.contacts.push(contact);
    } else {
      this.contactsStore.push(contact);
    }
  }
  isPhoneNumberExistInContact(contact) {
    return contact.phoneNumbers && contact.phoneNumbers.length > 0;
  }

  isPhoneMatchWithContact(contact, registeredUserPhoneNumberArray) {
    let matchedPhoneNumber = [];
    lodash.each(contact.phoneNumbers, (phoneNumber) => {
      let phoneNumberWithoutCountryCode = this.phoneNumberWithoutCountryCode(phoneNumber.value);
      // console.log(registeredUserPhoneNumberArray);
      // console.log(phoneNumberWithoutCountryCode);
      if (registeredUserPhoneNumberArray.indexOf(phoneNumberWithoutCountryCode) > -1) {
        matchedPhoneNumber.push(phoneNumber);
      }
    });
    if (matchedPhoneNumber.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  phoneNumberWithoutCountryCode(phone) {

    try {
      let phoneNumber = phoneUtil.parse(phone, "");
      var contact = phoneUtil.format(phoneNumber, PNF.NATIONAL);
      return this.phoneFormat(contact);

    }
    catch (e) {
      //console.log(e);
      return this.phoneFormat(phone);
    }
  }

  phoneFormat(phone) {
    if (phone) {
      return phone.toString().replace(/^0+/, '').replace(')', '').replace('(', '').replace('-', '').replace('-', '').replace(' ', '').replace(' ', '');
    }
    return null;
  }

}