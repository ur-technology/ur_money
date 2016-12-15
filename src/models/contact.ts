import {FirebaseModel} from './firebase-model';

export class ContactModel extends FirebaseModel {
  userId: string;
  name: string;
  profilePhotoUrl: string;
  phone: string;
  phoneType: string;
  formattedPhone: string;
  wallet: any;
  email: string;
  original: any;

  constructor(public _containerPath: string, fieldValues: Object) {
    super(_containerPath, fieldValues);
    // do stuff here
  }

}
