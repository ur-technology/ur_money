import {Injectable, EventEmitter} from '@angular/core';
import {Platform} from 'ionic-angular';
import {Contacts} from 'ionic-native';
import {FakeContactsSource} from '../models/fake-contacts-source';
import {ContactModel} from '../models/contact';
import {UserModel} from '../models/user';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import * as log from 'loglevel';

export interface ContactGroups {
  members: ContactModel[];
  nonMembers: ContactModel[];
}

@Injectable()
export class ContactsService {
  currentUserCountryCode: string;
  currentUserId: string;
  currentUserPhone: string;
  contactGroups: any;
  contactsLoadedEmitter = new EventEmitter();

  constructor(private platform: Platform) {
  }

  getContacts(): Promise<ContactGroups> {
    let self = this;
    return new Promise((resolve, reject) => {
      if (self.contactGroups) {
        resolve(self.contactGroups);
      } else {
        self.contactsLoadedEmitter.subscribe((data) => {
          resolve(self.contactGroups);
        });
      }
    });
  }

  generateContactGroups(contacts: ContactModel[]): Promise<ContactGroups> {
    let self = this;
    return new Promise((resolve, reject) => {
      contacts = _.concat(contacts, self.extraContactsForSecondaryPhones(contacts));
      _.each(contacts, (contact) => {
        contact.formattedPhone = self.e164ToFormattedPhone(contact.phone);
      });
      contacts = _.sortBy(contacts, 'name');
      let groups = _.groupBy(contacts, function(c) { return c.userId ? 'members' : 'nonMembers'; });
      resolve({ members: groups['members'] || [], nonMembers: groups['nonMembers'] || [] });
    });
  }

  loadContacts(currentUserId: string, currentUserPhone: string, currentUserCountryCode: string) {
    let self = this;
    self.currentUserId = currentUserId;
    self.currentUserPhone = currentUserPhone;
    self.currentUserCountryCode = currentUserCountryCode;
    self.retrieveContactsFromDevice().then((contacts: ContactModel[]) => {
      return self.retrieveUserInfo(contacts);
    }).then((contactsWithUserInfo: ContactModel[]) => {
      return self.generateContactGroups(contactsWithUserInfo);
    }).then((contactGroups: ContactGroups) => {
      self.contactGroups = contactGroups;
      self.contactsLoadedEmitter.emit({});
    }, (error) => {
      log.warn(`unable to load contacts: ${error}`);
      self.contactGroups = {};
      self.contactsLoadedEmitter.emit({});
    });
  }

  private retrieveContactsFromDevice(): Promise<ContactModel[]> {
    let self = this;
    let startTime = new Date().getTime();
    return new Promise((resolve, reject) => {
      let contactsSource = self.platform.is('cordova') ? Contacts : FakeContactsSource;
      contactsSource.find(['*']).then((rawContacts) => {
        let contacts: ContactModel[] = [];
        _.each(rawContacts, (rawContact) => {
          let rawPhones = self.validRawPhones(rawContact.phoneNumbers || []);
          if (rawPhones.length === 0 || !rawContact.name || !rawContact.name.givenName || !rawContact.name.familyName) {
            return;
          }
          let originalContact = {
            id: rawContact.id,
            firstName: rawContact.name.givenName,
            middleName: rawContact.name.middleName || '',
            lastName: rawContact.name.familyName,
            phones: rawPhones,
            email: self.getBestEmail(rawContact.emails),
            profilePhotoUrl: null // TODO: assign this
          };
          let contact: ContactModel = new ContactModel('', {
            name: UserModel.fullName(originalContact),
            original: _.omitBy(originalContact, _.isNil) // remove null or undefined fields
          });
          contacts.push(contact);
        });
        log.debug(`retrieved ${contacts.length} contacts in ${new Date().getTime() - startTime} milliseconds`);
        resolve(contacts);
      }, (error) => {
        reject(error);
      });
    });
  };

  private retrieveUserInfo(contacts: ContactModel[]): Promise<ContactModel[]> {
    let self = this;
    let startTime = new Date().getTime();
    return new Promise((resolve, reject) => {
      let phonesToLookup: string[] = _.flatten(_.map(contacts, (contact: ContactModel) => { return _.map(contact.original.phones, 'value'); })) as string[];
      phonesToLookup = _.uniq(phonesToLookup);
      if (_.isEmpty(phonesToLookup)) {
        resolve([]);
        return;
      }

      let phoneLookupRef = firebase.database().ref('/phoneLookupQueue/tasks').push({
        userId: self.currentUserId,
        phones: phonesToLookup
      });
      let ref = phoneLookupRef.child('result');
      log.debug(`waiting for value at ${ref.toString()}`);
      ref.on('value', (snapshot) => {

        // wait until result element appears on phoneLookupRef
        let result: any = snapshot.val();
        if (!result) {
          return;
        }

        log.debug(`got value at ${ref.toString()}`, result);
        let phoneToUserMapping: any = result.numMatches > 0 ? result.phoneToUserMapping : {};
        ref.off('value');
        phoneLookupRef.remove();
        _.each(contacts, (contact) => {
          _.find(contact.original.phones, (originalPhone: any) => {
            let user = phoneToUserMapping[originalPhone.value];
            if (user) {
              contact.userId = user.userId;
              contact.name = user.name;
              contact.profilePhotoUrl = user.profilePhotoUrl;
              contact.wallet = user.wallet;
              contact.phone = originalPhone.value;
              contact.phoneType = 'mobile';
            }
            return !!user;
          });
          if (!contact.userId) {
            contact.name = UserModel.fullName(contact.original);
            contact.profilePhotoUrl = contact.original.profilePhotoUrl;
            contact.phone = contact.original.phones[0].value;
            contact.phoneType = contact.original.phones[0].type;
          }
        });
        log.debug(`retrieved ${contacts.length} contacts in ${new Date().getTime() - startTime} milliseconds`);
        resolve(contacts);
      }, (error) => {
        reject(error);
      });
    });
  }

  private extraContactsForSecondaryPhones(contacts: ContactModel[]) {
    let extraContacts = [];
    _.each(contacts, (contact) => {
      if (contact.userId || contact.original.phones.length < 2) {
        return;
      }
      let secondaryOriginalPhones = _.slice(contact.original.phones, 1);
      _.each(secondaryOriginalPhones, (originalPhone: any, index) => {
        let extraContact: ContactModel = _.clone(contact);
        extraContact.phone = originalPhone.value;
        extraContact.phoneType = originalPhone.type;
        extraContacts.push(extraContact);
      });
    });
    return extraContacts;
  };

  private getBestEmail(rawEmails: any[]): string {
    let self = this;
    let validEmails = _.filter(rawEmails, function(rawEmail: any) {
      return self.isValidEmail(rawEmail.value);
    });
    let preferredEmails = _.filter(rawEmails, function(rawEmail: any) {
      return rawEmail.pref;
    });

    if (preferredEmails.length > 0) {
      return preferredEmails[0].value;
    } else if (validEmails.length > 0) {
      return validEmails[0].value;
    } else {
      return undefined;
    }
  }

  private isValidEmail(email: string): boolean {
    var pattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([-a-z0-9_]+)|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
    return pattern.test(email);
  }

  private validRawPhones(rawPhones: any) {
    let self = this;
    _.each(rawPhones, (rawPhone: any) => {
      let e164Phone = self.toE164(rawPhone.value);
      if (e164Phone && (rawPhone.type === 'mobile' || rawPhone.type === 'home') && rawPhone.value !== self.currentUserPhone) {
        rawPhone.value = e164Phone;
      } else {
        rawPhone.value = undefined;
      }
    });
    return _.uniqBy(_.filter(rawPhones, 'value'), 'value');
  }

  private toE164(phone: string): string {
    let e164Phone;
    let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
    let phoneNumberFormat = require('google-libphonenumber').PhoneNumberFormat;
    try {
      let initialPlus = /^\+/.test(phone);
      let strippedPhone = phone.replace(/\D/g, '');
      if (!strippedPhone) {
        return undefined;
      }
      if (initialPlus) {
        strippedPhone = '+' + strippedPhone;
      }

      let phoneNumberObject = phoneNumberUtil.parse(strippedPhone, this.currentUserCountryCode);
      if (phoneNumberUtil.isValidNumber(phoneNumberObject)) {
        e164Phone = phoneNumberUtil.format(phoneNumberObject, phoneNumberFormat.E164);
        if (this.currentUserCountryCode === 'MX' && /^\+52[2-9]/.test(e164Phone)) {
          // In Mexico, The 1 after +52 indicates that a number is mobile,
          // but it's often left out of contacts because most carriers don't require it.
          // If the 1 is  missing, we add it back to normalize the number.
          e164Phone = '+521' + e164Phone.substring(3);
          let phoneNumberObject = phoneNumberUtil.parse(strippedPhone, this.currentUserCountryCode); // TODO: handle this better
          e164Phone = phoneNumberUtil.format(phoneNumberObject, phoneNumberFormat.E164);
        }

      }
    } catch (e) {
      if (!/The string supplied did not seem to be a phone number/.test(e.message)) {
        log.debug(`error parsing or validating phone number '${phone}': ${e.message}`);
      }
    }
    return e164Phone;
  }

  private e164ToFormattedPhone(e164Phone: string): string {
    let formattedPhone;
    let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
    let phoneNumberFormat = require('google-libphonenumber').PhoneNumberFormat;
    try {
      let phoneNumberObject = phoneNumberUtil.parse(e164Phone, this.currentUserCountryCode);
      formattedPhone = phoneNumberUtil.format(phoneNumberObject, phoneNumberFormat.INTERNATIONAL);
    } catch (e) {
      log.debug(`error formatting phone number '${formattedPhone}': ${e.message}`);
    }
    return formattedPhone;
  }

}
