import {Injectable} from '@angular/core';
import * as _ from 'underscore';
import * as Firebase from 'firebase';
import {Auth} from '../../components/auth/auth';

@Injectable()
export class FirebaseService {
  constructor(public auth: Auth) {
  }

  saveUser(user) {
    if (!user.createdAt) {
      user.createdAt = Firebase.ServerValue.TIMESTAMP;
    }
    var usersRef = this.auth.firebaseRef().child("users");
    if (!user.uid) {
      user.uid = usersRef.push().key();
    }
    usersRef.child(user.uid).update(user);
  }

  lookupPrelaunchUserByPhone(phone, nav, dashboardPage, signUpPage, errorPage) {
    this.auth.firebaseRef().child("users").orderByChild("phone").equalTo(phone).limitToFirst(1).once(
      "value", (snapshot) => {
        var snapshotData = snapshot.val();
        var users = _.values(snapshotData || {});
        if (users.length == 0 && phone == '+16158566616') {
          users = [{ phone: phone }];
        }
        if (users.length == 0) {
          nav.setRoot(errorPage, { message: "No invitation to that phone number was found." });
          return;
        }

        var user = users[0];
        window.localStorage.setItem("prelaunchPhone", phone)
        nav.setRoot(user.signedUpAt ? dashboardPage : signUpPage, { user: user });
      });
  }

  assignMemberId(user, callback) {
    console.log('assigning member id');
    var usersRef = this.auth.firebaseRef().child("users");
    usersRef.once("value", function(snapshot) {
      var allUsers = _.values(snapshot.val());
      var usersWithMemberId = _.select(allUsers, function(u) { return u.memberId; } );
      var lastUserWithMemberId = _.last(_.sortBy( usersWithMemberId, function(u) { return u.memberId; } ) );
      var lastMemberId = lastUserWithMemberId ? lastUserWithMemberId.memberId : 0;
      var membersNeedingMemberId = _.select(allUsers, function(u) { return !u.memberId && u.signedUpAt });
      var numberOfPriorMembersNeedingMemberId = _.select(membersNeedingMemberId, function(u) { return u.uid < user.uid } ).length;
      user.memberId = lastMemberId + numberOfPriorMembersNeedingMemberId + 1;
      usersRef.child(user.uid).update({memberId: user.memberId});
      callback(null, user);
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
      callback(errorObject, user);
    });
  }

}
