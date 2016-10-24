import {FirebaseModel} from './firebase-model';
import * as _ from 'lodash';

export class UserModel extends FirebaseModel {
  admin: boolean;
  chats: any;
  chatSummaries: any;
  city: string;
  countryCode: string;
  createdAt: number;
  deviceCountryCode: string;
  deviceIdentity: any;
  downlineLevel: number;
  inviteCode: string;
  inviter: any;
  firstName: string;
  middleName: string;
  lastName: string;
  name: string;
  lastSignedInAt: number;
  memberId: number;
  phone: string;
  profilePhotoUrl: string;
  smsMessages: any;
  stateName: string;
  identityVerification: any;
  wallet: any;
  pending: boolean;

  setProfilePhotoUrl() {
    var colorScheme = _.sample([
      { background: 'DD4747', foreground: 'FFFFFF' },
      { background: 'ED6D54', foreground: 'FFFFFF' },
      { background: 'FFBE5B', foreground: 'FFFFFF' },
      { background: 'FFE559', foreground: 'FFFFFF' }
    ]);
    var initials = 'XX';
    if (this.firstName) {
      var firstLetters = this.firstName.match(/\b\w/g);
      initials = firstLetters[0];
      var lastNameFirstLetter = (this.lastName || '').match(/\b\w/g);
      initials = initials + lastNameFirstLetter[0];
      initials = initials.toUpperCase();
    }
    this.profilePhotoUrl = 'https://dummyimage.com/100x100/' + colorScheme.background + '/' + colorScheme.foreground + '&text=' + initials;
  }

  static fullName(user: any) {
    return _.trim(`${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`).replace(/  /, ' ');
  }

}
