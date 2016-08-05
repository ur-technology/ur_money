import {FirebaseModel} from './firebase-model';
import * as _ from 'lodash';

export class ContactModel extends FirebaseModel {
  userId: string
  firstName: string;
  middleName: string;
  lastName: string;
  profilePhotoUrl: string
  phone: string;
  formattedPhone: string;
  phoneType: string;
  email: string;
  deviceContactId: string;
  rawPhones: Object[];

  constructor(public _containerPath: string, fieldValues: Object) {
    super(_containerPath, fieldValues);
    // do stuff here
  }

  fullName() {
    return _.trim(`${this.firstName || ''} ${this.middleName || ''} ${this.lastName || ''}`).replace(/  /, ' ');
  }
}
