import { Injectable } from '@angular/core';
import {Platform, Alert} from 'ionic-angular';

// Native Plugins
import {Contacts} from 'ionic-native';

@Injectable()
export class NativeContactsService {
  contacts: Array<any>[];
  constructor(private platform: Platform) {
    this.loadAllContactsFromDevice();
  }

  loadAllContactsFromDevice() {
    return new Promise((resolve, reject) => {
      if (this.contacts) {
        resolve(this.contacts);
      }
      this.platform.ready().then(() => {
        Contacts.find(['*']).then((data) => {
          console.log(data);
          this.contacts = data;
          resolve(this.contacts);
        }, (err) => {
          console.log(err);
          reject(err);
        })
      });
    });
  }

  getDeviceContacts() {
    return this.loadAllContactsFromDevice();
  }

}
