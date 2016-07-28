import {FirebaseModel} from './firebase-model';
import * as _ from 'lodash';

export class User extends FirebaseModel {
  admin: boolean;
  chats: any;
  chatSummaries: any;
  city: string;
  countryCode: string;
  createdAt: number;
  deviceCountryCode: string;
  deviceIdentity: any;
  downlineLevel: number;
  firstName: string;
  inviteCode: string;
  inviter: any;
  lastName: string;
  lastSignedInAt: number;
  memberId: number;
  middleName: string;
  phone: string;
  profilePhotoUrl: string;
  signedUpAt: number;
  smsMessages: any;
  stateName: string;
  verifiedAt: number;
  wallet: any;
  pending: boolean;

  generateInviteCode() {
    this.inviteCode = ''
    let letters = "ABCDEFGHKMNPRSTWXYZ2345689";
    for (var i = 0; i < 6; i++) {
      let position = Math.floor(Math.random() * letters.length);
      this.inviteCode = this.inviteCode + letters.charAt(position);
    }
  }

  generateProfilePhotoUrl() {
    var colorScheme = _.sample([
      { background: "DD4747", foreground: "FFFFFF" },
      { background: "ED6D54", foreground: "FFFFFF" },
      { background: "FFBE5B", foreground: "FFFFFF" },
      { background: "FFE559", foreground: "FFFFFF" }
    ]);
    var initials = 'XX';
    if (this.firstName) {
      var firstLetters = this.firstName.match(/\b\w/g);
      initials = firstLetters[0];
      var lastNameFirstLetter = (this.lastName || '').match(/\b\w/g);
      initials = initials + lastNameFirstLetter[0];
      initials = initials.toUpperCase();
    }
    this.profilePhotoUrl = "https://dummyimage.com/100x100/" + colorScheme.background + "/" + colorScheme.foreground + "&text=" + initials;
  }

}
