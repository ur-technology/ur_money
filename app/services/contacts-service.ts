import {Injectable} from '@angular/core';
import {Platform, Alert} from 'ionic-angular';
import {Contacts} from 'ionic-native';
import {Contact} from '../models/contact';
import * as _ from 'lodash';
import * as log from 'loglevel';

@Injectable()
export class ContactsService {
  contacts: Contact[];
  contactGroups: any;
  countryCode: string;
  currentUserId: string;
  currentUserRef: string;
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
        self.retrieveContactsFromDevice().then(() => {
          log.debug(`retrieved contacts in ${new Date().getTime() - startTime} milliseconds`)

          startTime = new Date().getTime();
          self.assignUserIdsToContacts().then(() => {
            // clean up contacts list
            _.remove(self.contacts, (contact) => { return contact.userId == self.currentUserId; });
            self.contacts = _.concat(self.contacts, self.extraContactsForSecondaryPhones());
            _.each(self.contacts, (contact) => { self.assignPhoneInfoToContact(contact); });
            self.contacts = _.sortBy(self.contacts, (c) => { return c.fullName(); });

            // partition contacts into members and non-members
            self.contactGroups = _.groupBy(self.contacts, function(c) { return c.userId ? "members" : "nonMembers"; });
            if (!self.contactGroups.members) {
              self.contactGroups.members = [];
            }
            if (!self.contactGroups.nonMembers) {
              self.contactGroups.nonMembers = [];
            }

            self.loaded = true;
            log.debug(`processed ${self.contacts.length} contacts (${self.contactGroups.members.length} members/${self.contactGroups.nonMembers.length} non-members) in ${new Date().getTime() - startTime} milliseconds`)
            resolve(self.contactGroups);
          }, (error) => {
            reject(error);
          });
        });
      });
    });
  }

  private assignPhoneInfoToContact(contact) {
    if (contact.rawPhones && contact.rawPhones[0]) {
      contact.phone = contact.rawPhones[0].value;
      contact.formattedPhone = this.e164ToFormattedPhone(contact.phone);
      contact.phoneType = contact.rawPhones[0].type;
    }
    delete contact.rawPhones;
  }

  private retrieveContactsFromDevice(): Promise<any> {
    let self = this;
    return new Promise((resolve, reject) => {
      if (!self.platform.is('cordova')) {
        self.contacts = self.fakeContacts();
        resolve(undefined);
        return;
      }

      Contacts.find(['*']).then((rawContacts) => {
        self.contacts = [];
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

              let x = 7; // TODO: assign contact.photo
            }
            if (rawContact.middleName) {
              contact.middleName = rawContact.middleName;
            }
            let email: string = self.getBestEmail(rawContact.emails);
            if (email) {
              contact.email = rawContact.email;
            }
            self.contacts.push(contact);
          }
        });
        resolve(undefined);
      }, (error) => {
        reject(error);
      });
    });
  };

  private assignUserIdsToContacts() {
    let self = this;
    return new Promise((resolve, reject) => {
      let currentUserRef = firebase.database().ref(`/users/${this.currentUserId}`)
      let contactLookup = {
        pending: true,
        contacts: _.map(self.contacts, (contact: Contact) => {
          return {
            phones: _.map(contact.rawPhones, (rawPhone: any) => {
              return rawPhone.value;
            })
          };
        })
      };
      let contactLookupRef = currentUserRef.child("contactLookups").push(contactLookup);
      contactLookupRef.on('child_added', (snapshot) => {
        if (snapshot.key != 'processedContacts') {
          return;
        }
        contactLookupRef.off('child_added');
        let processedContacts = snapshot.val();
        _.each(processedContacts, (processedContact, i) => {
          let index = parseInt(i);
          if (processedContact.userId) {
            self.contacts[index].userId = processedContact.userId

            // move raw phone correspeonding to registered phone number to beginning of rawPhone array
            let registeredRawPhone = self.contacts[index].rawPhones.splice(processedContact.registeredPhoneIndex, 1)[0];
            self.contacts[index].rawPhones.unshift(registeredRawPhone);
          }
          if (index == processedContacts.length - 1) {
            contactLookupRef.remove()
            resolve();
          }
        });
      });
    });
  }

  private extraContactsForSecondaryPhones() {
    let self = this;
    let extraContacts = _.map(self.contacts, (contact) => {
      if (contact.userId || !contact.rawPhones || contact.rawPhones.length < 2) {
        return [];
      }

      return _.map(_.slice(contact.rawPhones, 1), (rawPhone: any, index) => {
        let duplicateContact: Contact = _.clone(contact);
        duplicateContact.rawPhones = [rawPhone];
        return duplicateContact;
      });
    });
    return _.flatten(extraContacts);
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
        log.debug(`error parsing or validating phone number '${phone}': ${e.message}`);
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
      log.debug(`error formatting phone number '${formattedPhone}': ${e.message}`);
    }
    return formattedPhone;
  }

  private fakeContacts(): Contact[] {
    return _.map([
      {
        "firstName": "Eiland",
        "lastName": "Glover",
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2Favatar-40.jpg?alt=media&token=a2226754-081c-43ea-98e4-48870877a253",
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
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2Favatar-6.jpg?alt=media&token=9c4b1623-9971-40cb-8aa0-74bf2188e028",
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
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117",
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
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2Favatar.jpg?alt=media&token=083aeded-1e4c-4178-a6e6-dc9a3131d78e",
        "rawPhones": [{
          "id": "4",
          "pref": false,
          "value": "+593998016833",
          "type": "mobile"
        }],
        "deviceContactId": "4"
      },  {
        "firstName": "TestFirstname",
        "lastName": "TestLastname",
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2Favatar-35.jpg?alt=media&token=c792966a-043c-4a02-9a31-58ea9b8715ed",
        "rawPhones": [{
          "id": "44",
          "pref": false,
          "value": "+16193611786",
          "type": "mobile"
        }],
        "deviceContactId": "44"
      }, {
        "firstName": "Alpha",
        "lastName": "Andrews",
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117",
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
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117",
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
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117",
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
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117",
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
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117",
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
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117",
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
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117",
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
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117",
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
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117",
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
        "profilePhotoUrl": "https://firebasestorage.googleapis.com/v0/b/ur-money-staging.appspot.com/o/avatars%2FGeneric_Avatar.jpg?alt=media&token=0929f75e-a294-4331-a001-00ce22a8b117",
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
    ], (attrs) => { return new Contact("", attrs); });
  }
}
