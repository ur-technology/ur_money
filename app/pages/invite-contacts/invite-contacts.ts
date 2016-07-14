import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import {ContactOrderPipe} from '../../pipes/contactOrderPipe';
import {NativeContactsService} from '../../components/services/native-contact.service';
import {ContactsService} from '../../components/services/contacts.service';
import {Subscription} from 'rxjs';
import * as lodash from 'lodash';
import libphonenumber = require('google-libphonenumber');
const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
const PNF = libphonenumber.PhoneNumberFormat;

// Native Plugins
import {SocialSharing} from 'ionic-native';
import {Contacts} from 'ionic-native';


/*
  Generated class for the InviteContactsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  pipes: [ContactOrderPipe],
  templateUrl: 'build/pages/invite-contacts/invite-contacts.html',
})
export class InviteContactsPage {
  isUserLoaded = false;
  isContactsLoaded = false;
  contacts = [];
  inviteType: string;
  inviteData: any = {};
  intviteContacts = [];
  deviceContacts = [];
  userOnApp = [];
  constructor(private nav: NavController, private navParams: NavParams,
    private platform: Platform, private nativeContactService: NativeContactsService,
    private contactsService: ContactsService) {
    this.populateContacts();
    this.inviteType = this.navParams.get('inviteType');
    this.inviteData = this.navParams.get('inviteData');
  }



  populateContacts() {
    this.getUserList();
    this.nativeContactService.getDeviceContacts().then((data: Array<any>) => {
      //console.log(data);
      this.deviceContacts = data;
      this.isContactsLoaded = true;
      this.createContactList();
    });
  }

  getUserList() {
    let subscriptionContacts: Subscription = this.contactsService.getContacts().subscribe(data => {
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
    if (this.isUserLoaded && this.isContactsLoaded) {
      let registerUserContactNumbers = [];
      lodash.each(this.userOnApp, (user) => {
        registerUserContactNumbers.push(this.phoneNumberWithoutCountryCode(user.phone));
      });

      lodash.each(this.deviceContacts, (contact) => {
        if (this.isPhoneNumberExistInContact(contact)) {
          let inviteContacts = {
            name: contact.displayName,
            imgID: contact.photos ? lodash.first(contact.photos) : null,
            email: contact.emails,
            phone: lodash.first(contact.phoneNumbers),
            invite: false,
            id: contact.id
          };
          if (this.isPhoneMatchWithContact(contact, registerUserContactNumbers)) {
            inviteContacts.invite = true
            this.contacts.push(inviteContacts);
          } else {
            this.contacts.push(inviteContacts);
          }
        }
      });
      console.log(this.contacts);
    }
  }

  isPhoneNumberExistInContact(contact) {
    return contact.phoneNumbers && contact.phoneNumbers.length > 0;
  }

  isPhoneMatchWithContact(contact, registeredUserPhoneNumberArray) {
    let matchedPhoneNumber = [];
    lodash.each(contact.phoneNumbers, (phoneNumber) => {
      let phoneNumberWithoutCountryCode = this.phoneNumberWithoutCountryCode(phoneNumber);
      if (lodash.find(registeredUserPhoneNumberArray, phoneNumberWithoutCountryCode)) {
        matchedPhoneNumber.push(phoneNumber);
      }
    });
    if (matchedPhoneNumber.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  phoneNumberWithoutCountryCode(phone) {
    try {
      let phoneNumber = phoneUtil.parse(phone, "");
      return phoneUtil.format(phoneNumber, PNF.NATIONAL);
    }
    catch (e) {
      //  console.log(e);
      return phone;
    }
  }


  inviteNow(contact) {
    switch (this.inviteType) {
      case 'email':
        this.sendEmailToContact(contact);
        break;
      case 'sms':
      default:
        this.sendSmsToContact(contact);
        break;
    }
  }


  sendSmsToContact(contact) {
    SocialSharing.shareViaSMS(this.inviteData.messageText, contact.phone).then((data) => {
      console.log(data);
    });
  }

  sendEmailToContact(contact) {
    let toArr = [contact.email];
    SocialSharing.shareViaEmail(this.inviteData.body, this.inviteData.subject, toArr, null, null, null).then((data) => {
      console.log(data);
    });
  }



}
