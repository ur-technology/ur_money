import {Injectable} from '@angular/core';
import {Platform, Alert} from 'ionic-angular';
import {Contacts} from 'ionic-native';
import {Contact} from '../models/contact';
import * as _ from 'lodash';

@Injectable()
export class ContactsService {
  contactGroups: any;
  countryCode: string;
  currentUserId: string;
  loaded: boolean = false;

  constructor(private platform: Platform) {
  }

  load(countryCode: string, currentUserId: string): Promise<any[]> {
    let self = this;
    self.countryCode = countryCode;
    self.currentUserId = currentUserId;
    return new Promise((resolve, reject) => {
      if (self.loaded) {
        resolve(self.contactGroups);
        return;
      }

      let startTime = new Date().getTime();
      self.platform.ready().then(() => {
        if (!self.platform.is('cordova')) {
          self.retrieveContactsFromDevice = self.fake_retrieveContactsFromDevice;
        }

        self.retrieveContactsFromDevice().then((contactsFromDevice) => {
          let contacts: Contact[] = contactsFromDevice;
          console.log(`retrieved contacts in ${new Date().getTime() - startTime} milliseconds`)

          startTime = new Date().getTime();
          self.assignUserIdsToContacts(contacts).then(() => {
            contacts = _.reject(contacts, (c) => { return c.userId == this.currentUserId; });
            contacts = _.sortBy(contacts, (c) => { return c.fullName(); });
            contacts = _.flatten(_.map(contacts, (contact) => { return self.contactAndDuplicates(contact); }));
            _.each(_.map(contacts, (contact) => { delete contact.rawPhones; }));
            self.contactGroups = _.groupBy(contacts, function(c) { return c.userId ? "members" : "nonMembers"; });
            if (!self.contactGroups.members) {
              self.contactGroups.members = [];
            }
            if (!self.contactGroups.nonMembers) {
              self.contactGroups.nonMembers = [];
            }
            self.loaded = true;
            console.log(`processed contacts in ${new Date().getTime() - startTime} milliseconds`)
            resolve(self.contactGroups);
          }, (error) => {
            reject(error);
          });
        });
      });
    });
  }

  private retrieveContactsFromDevice(): Promise<Contact[]> {
    let self = this;
    return new Promise((resolve, reject) => {
      Contacts.find(['*']).then((rawContacts) => {
        let contacts = [];
        _.each(rawContacts, (rawContact) => {
          let rawPhones = self.validRawPhones(rawContact.phoneNumbers || []);
          if (rawPhones.length > 0 && rawContact.name && rawContact.name.givenName && rawContact.name.familyName) {
            let contact: Contact = new Contact("", {
              firstName: rawContact.name.givenName,
              lastName: rawContact.name.familyName,
              rawPhones: rawPhones,
              deviceContactId: rawContact.id
            });
            if (rawContact.photos && rawContact.photos.length > 0) {
              // TODO: assign contact.photo
            }
            if (rawContact.middleName) {
              contact.middleName = rawContact.middleName;
            }
            let email: string = self.getBestEmail(rawContact.emails);
            if (email) {
              contact.email = rawContact.email;
            }
            contacts.push(contact);
          }
        });
        resolve(contacts);
      }, (error) => {
        reject(error);
      });
    });
  };


  private assignUserIdsToContacts(contacts) {
    let self = this;
    return new Promise((resolve, reject) => {
      let contactsRemaining = contacts.length;
      let rejected = false;
      _.each(contacts, function(contact) {
        self.assignUserIdToContact(contact).then(() => {
          if (rejected) {
            return;
          }
          contactsRemaining--;
          if (contactsRemaining == 0) {
            resolve();
          }
        }, (error) => {
          rejected = true;
          reject(error);
        });
      });
    });
  }

  private contactAndDuplicates(contact: any) { // TODO: rename this method to describe what it actually does
    // if original contact is a non-member with multiple phones, then
    // add a duplicate contact for each phone and add a phone-type label
    let rawPhonesToUse = contact.userId ? [contact.rawPhones[0]] : contact.rawPhones;
    return _.map(rawPhonesToUse, (rawPhone: any, index) => {
      let contactOrDupe: Contact = index == 0 ? contact : _.clone(contact);
      contactOrDupe.phone = rawPhone.value;
      contactOrDupe.formattedPhone = this.e164ToFormattedPhone(contactOrDupe.phone);
      if (!contact.userId && rawPhonesToUse.length > 1) {
        contactOrDupe.phoneType = rawPhone.type;
      }
      return contactOrDupe;
    });
  };


  private assignUserIdToContact(contact: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let rawPhonesRemaining = contact.rawPhones.length;
      let rejected = false;
      _.each(contact.rawPhones, function(rawPhone) {
        firebase.database().ref('/users').orderByChild('phone').equalTo(rawPhone.value).limitToFirst(1).once('value').then((snapshot) => {
          if (rejected) {
            return;
          }
          rawPhonesRemaining--;
          if (snapshot.exists() && !contact.userId) {
            contact.userId = _.first(_.keys(snapshot.val()));
            rawPhonesRemaining = 0;
          }
          if (rawPhonesRemaining == 0) {
            resolve();
          }
        }, (error) => {
          console.log("error looking up userId by phone", error);
          rejected = true;
          reject(error);
        });
      });
    });
  }

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
    return pattern.test(email)
  }

  private validRawPhones(rawPhones: any) {
    let self = this;
    _.each(rawPhones, (rawPhone: any) => {
      let e164Phone = self.toE164(rawPhone.value);
      if (e164Phone && rawPhone.type == 'mobile' || rawPhone.type == 'home') {
        rawPhone.value = e164Phone;
      } else {
        rawPhone.value = undefined;
      }
    });
    return _.uniqBy(_.filter(rawPhones, 'value'), 'value');
  }

  private toE164(phone: string): string {
    let e164Phone;
    let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();;
    let phoneNumberFormat = require('google-libphonenumber').PhoneNumberFormat;
    try {
      let initialPlus = /^\+/.test(phone);
      let strippedPhone = phone.replace(/\D/g, '');
      if (!strippedPhone) {
        return undefined;
      }
      if (initialPlus) {
        strippedPhone = "+" + strippedPhone;
      }

      let phoneNumberObject = phoneNumberUtil.parse(strippedPhone, this.countryCode);
      if (phoneNumberUtil.isValidNumber(phoneNumberObject)) {
        e164Phone = phoneNumberUtil.format(phoneNumberObject, phoneNumberFormat.E164);
        if (this.countryCode == 'MX' && /^\+52[2-9]/.test(e164Phone)) {
          // In Mexico, The 1 after +52 indicates that a number is mobile,
          // but it's often left out of contacts because most carriers don't require it.
          // If the 1 is  missing, we add it back to normalize the number.
          e164Phone = "+521" + e164Phone.substring(3);
          let phoneNumberObject = phoneNumberUtil.parse(strippedPhone, this.countryCode); // TODO: handle this better
          e164Phone = phoneNumberUtil.format(phoneNumberObject, phoneNumberFormat.E164);
        }

      }
    } catch (e) {
      if (!/The string supplied did not seem to be a phone number/.test(e.message)) {
        console.log(`error parsing or validating phone number '${phone}': ${e.message}`);
      }
    }
    return e164Phone;
  }

  private e164ToFormattedPhone(e164Phone: string): string {
    let formattedPhone;
    let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();;
    let phoneNumberFormat = require('google-libphonenumber').PhoneNumberFormat;
    try {
      let phoneNumberObject = phoneNumberUtil.parse(e164Phone, this.countryCode);
      formattedPhone = phoneNumberUtil.format(phoneNumberObject, phoneNumberFormat.INTERNATIONAL);
    } catch (e) {
      console.log(`error formatting phone number '${formattedPhone}': ${e.message}`);
    }
    return formattedPhone;
  }

  private fake_retrieveContactsFromDevice(): Promise<Contact[]> {
    return new Promise((resolve, reject) => {
      resolve(_.map([
        {
          "firstName": "Eiland",
          "lastName": "Glover",
          "rawPhones": [{
            "id": "1",
            "pref": false,
            "value": "+16158566616",
            "type": "mobile"
          }],
          "deviceContactId": "1"
        }, {
          "firstName": "John",
          "lastName": "Reitano",
          "rawPhones": [{
            "id": "2",
            "pref": false,
            "value": "+16196746211",
            "type": "mobile"
          }],
          "deviceContactId": "2"
        }, {
          "firstName": "Malkiat",
          "lastName": "Singh",
          "rawPhones": [{
            "id": "3",
            "pref": false,
            "value": "+919915738619",
            "type": "mobile"
          }],
          "deviceContactId": "3"
        }, {
          "firstName": "Xavier",
          "lastName": "Perez",
          "rawPhones": [{
            "id": "4",
            "pref": false,
            "value": "+593998016833",
            "type": "mobile"
          }],
          "deviceContactId": "4"
        }, {
          "firstName": "Alpha",
          "lastName": "Andrews",
          "rawPhones": [{
            "id": "40",
            "pref": false,
            "value": "+16197778001",
            "type": "mobile"
          }],
          "deviceContactId": "7"
        }, {
          "firstName": "Beta",
          "lastName": "Brown",
          "rawPhones": [{
            "id": "70",
            "pref": false,
            "value": "+16197778002",
            "type": "home"
          }, {
              "id": "72",
              "pref": false,
              "value": "+16197778004",
              "type": "mobile"
            }, {
              "id": "73",
              "pref": false,
              "value": "+16197778005",
              "type": "work"
            }],
          "deviceContactId": "8"
        }, {
          "firstName": "Gamma",
          "lastName": "Gallant",
          "rawPhones": [{
            "id": "95",
            "pref": false,
            "value": "+16197778006",
            "type": "mobile"
          }],
          "deviceContactId": "9"
        }, {
          "firstName": "Delta",
          "lastName": "Daniels",
          "rawPhones": [{
            "id": "197",
            "pref": false,
            "value": "+16197778007",
            "type": "home"
          }, {
              "id": "199",
              "pref": false,
              "value": "+16197778008",
              "type": "mobile"
            }],
          "deviceContactId": "10"
        }, {
          "firstName": "Epsilon",
          "lastName": "Ellison",
          "rawPhones": [{
            "id": "152",
            "pref": false,
            "value": "+16197778009",
            "type": "mobile"
          }],
          "deviceContactId": "13"
        }, {
          "firstName": "Zeta",
          "lastName": "Zenderson",
          "rawPhones": [{
            "id": "49",
            "pref": false,
            "value": "+16197778010",
            "type": "mobile"
          }],
          "deviceContactId": "16"
        }, {
          "firstName": "Eta",
          "lastName": "Edwards",
          "rawPhones": [{
            "id": "232",
            "pref": false,
            "value": "+16197778011",
            "type": "mobile"
          }],
          "deviceContactId": "17"
        }, {
          "firstName": "Theta",
          "lastName": "Thierry",
          "rawPhones": [{
            "id": "222",
            "pref": false,
            "value": "+16197778012",
            "type": "mobile"
          }],
          "deviceContactId": "18"
        }, {
          "firstName": "Iota",
          "lastName": "Immerson",
          "rawPhones": [{
            "id": "140",
            "pref": false,
            "value": "+16197778013",
            "type": "home"
          }, {
              "id": "142",
              "pref": false,
              "value": "+16197778014",
              "type": "mobile"
            }],
          "deviceContactId": "19"
        }, {
          "firstName": "Kappa",
          "lastName": "Krell",
          "rawPhones": [{
            "id": "84",
            "pref": false,
            "value": "+16197778015",
            "type": "home"
          }, {
              "id": "86",
              "pref": false,
              "value": "+16197778016",
              "type": "mobile"
            }],
          "deviceContactId": "20"
        }, {
          "firstName": "Lambda",
          "lastName": "Landau",
          "rawPhones": [{
            "id": "184",
            "pref": false,
            "value": "+5216643332222",
            "type": "mobile"
          }, {
              "id": "186",
              "pref": false,
              "value": "+5216643332223",
              "type": "mobile"
            }],
          "deviceContactId": "20"
        }
      ], (attrs) => { return new Contact("", attrs); }));
    });
  };
}
