import { Injectable, EventEmitter } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Contacts } from '@ionic-native/contacts';
import { FakeContactsSource } from '../models/fake-contacts-source';
import { ContactModel } from '../models/contact.model';
import { UserModel } from '../models/user.model';
import { Utils } from '../services/utils';
import * as _ from 'lodash';
import * as log from 'loglevel';
import * as firebase from 'firebase';

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

  constructor(private platform: Platform, private contacts: Contacts) {
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
        contact.formattedPhone = Utils.toInternationalFormatPhoneNumber(contact.phone, self.currentUserCountryCode);
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
      let contactsSource: any = self.platform.is('cordova') ? Contacts : FakeContactsSource;
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
          let contact: ContactModel = new ContactModel();
          contact.name = UserModel.fullName(originalContact);
          contact.original = _.omitBy(originalContact, _.isNil);

          contacts.push(contact);
        });
        log.trace(`retrieved ${contacts.length} contacts in ${new Date().getTime() - startTime} milliseconds`);
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
      log.trace(`waiting for value at ${ref.toString()}`);
      ref.on('value', (snapshot) => {

        // wait until result element appears on phoneLookupRef
        let result: any = snapshot.val();
        if (!result) {
          return;
        }

        log.trace(`got value at ${ref.toString()}`, result);
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
        log.trace(`retrieved ${contacts.length} contacts in ${new Date().getTime() - startTime} milliseconds`);
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
      let e164Phone = Utils.toE164FormatPhoneNumber(rawPhone.value, self.currentUserCountryCode);
      if (e164Phone && (rawPhone.type === 'mobile' || rawPhone.type === 'home') && rawPhone.value !== self.currentUserPhone) {
        rawPhone.value = e164Phone;
      } else {
        rawPhone.value = undefined;
      }
    });
    return _.uniqBy(_.filter(rawPhones, 'value'), 'value');
  }

}
