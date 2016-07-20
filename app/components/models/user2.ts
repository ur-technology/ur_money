import {FirebaseModel} from './firebase-model';

export class User2 extends FirebaseModel {
  createdAt: number;
  invitedAt: number;
  signedUpAt: number;
  lastSignedInAt: number;
  downlineLevel: number;
  memberId: number;
  firstName: string;
  lastName: string;
  phone: string;
  profilePhotoUrl: string;

  static fieldsExcludedFromSaving(): Array<string> {
    return ['profilePhotoUrl'];
  }


}
