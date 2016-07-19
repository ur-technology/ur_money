import { Injectable } from '@angular/core';
import {Platform} from 'ionic-angular';
import {Invite} from '../models/invite';

import {AngularFire, FirebaseRef, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';

@Injectable()

export class InviteService {

  constructor(public angularFire: AngularFire) {

  }

  generateInviteCode(): string {
    let code = ''
    let letters = "ABCDEFGHKMNPRSTWXYZ2345689";
    for (var i = 0; i < 6; i++) {
      let position = Math.floor(Math.random() * letters.length);
      code = code + letters.charAt(position);
    }
    return code;
  }

  createInvite(userId) {
    let invite = new Invite();
    invite.createdAt = firebase.database.ServerValue.TIMESTAMP;
    invite.inviteCode = this.generateInviteCode();
    invite.inviteUid = userId;
    invite.updatedAt = firebase.database.ServerValue.TIMESTAMP;
    let inviteRef = this.angularFire.database.list('/invite').push(invite);
    return invite.inviteCode;
  }



}