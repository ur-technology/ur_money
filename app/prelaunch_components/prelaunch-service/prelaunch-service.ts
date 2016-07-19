import {Injectable, Inject} from '@angular/core';
import * as _ from 'lodash';
import {AngularFire, FirebaseObjectObservable} from 'angularfire2';
import {Auth} from '../../components/auth/auth';

@Injectable()
export class PrelaunchService {
  constructor(public auth: Auth, public angularFire: AngularFire) {
  }

  saveUser(user) {
    if (!user.createdAt) {
      user.createdAt = Date.parse(new Date().toISOString());
    }
    var usersRef = this.auth.angularFire.database.list('/users');
    if (!user.uid) {
      let insertedRecords = usersRef.push(user);
      user.uid = insertedRecords.key;
    }
    usersRef.update(user.uid, user);
  }

  lookupPrelaunchUserByPhone(phone, nav, dashboardPage, signUpPage, errorPage) {
    this.angularFire.database.list('/users', {
      query: {
        orderByChild: 'phone',
        equalTo: phone,
        limitToFirst: 1
      }
    }).subscribe((snapshotData) => {
      var users = _.values(snapshotData || {});
      if (users.length == 0 && phone == '+16158566616') {
        users = [{ phone: phone }];
      }
      if (users.length == 0) {
        nav.setRoot(errorPage, { message: "No invitation to that phone number was found." });
        return;
      }

      var user: any = users[0];
      window.localStorage.setItem("prelaunchPhone", phone)
      nav.setRoot(user.signedUpAt ? dashboardPage : signUpPage, { user: user });
    });
  }

  assignMemberId(user, callback) {
    console.log('assigning member id');
    this.angularFire.database.list('/users').subscribe((allUsers) => {
      var usersWithMemberId = _.filter(allUsers, function (u) { return u.memberId; });
      var lastUserWithMemberId = _.last(_.sortBy(usersWithMemberId, function (u) { return u.memberId; }));
      var lastMemberId = lastUserWithMemberId ? lastUserWithMemberId.memberId : 0;
      var membersNeedingMemberId = _.filter(allUsers, function (u) { return !u.memberId && u.signedUpAt });
      var numberOfPriorMembersNeedingMemberId = _.filter(membersNeedingMemberId, function (u) { return u.uid < user.uid }).length;
      user.memberId = lastMemberId + numberOfPriorMembersNeedingMemberId + 1;
      this.angularFire.database.object(`/users/${user.uid}`).update({ memberId: user.memberId });
      callback(null, user);
    })
  }

}
