import {FirebaseModel} from './firebase-model';

export class InviteModel extends FirebaseModel {
  createdAt: number;
  inviteCode: string;
  inviterUserId: string;
  inviteeUserId: string;
  inviteeIp: string;
  contact: any;

  constructor(public _containerPath: string, fieldValues: Object) {
    super(_containerPath, fieldValues);
    this.createdAt = firebase.database.ServerValue.TIMESTAMP;
    this.inviteCode = this.generateInviteCode();
  }

  private generateInviteCode(): string {
    let code = '';
    let letters = 'ABCDEFGHKMNPRSTWXYZ2345689';
    for (var i = 0; i < 6; i++) {
      let position = Math.floor(Math.random() * letters.length);
      code = code + letters.charAt(position);
    }
    return code;
  }
}
