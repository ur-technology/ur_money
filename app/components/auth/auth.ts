import {Injectable, ViewChild} from '@angular/core'
import {Nav} from 'ionic-angular';
import {AngularFire} from 'angularfire2'
import {Component} from '@angular/core';
import * as _ from 'underscore'

@Injectable()

export class Auth {
  public uid: string
  public user: any
  // public authDataProfileImage: any
  // public authDataProfileName: any
  // public authDataProfileDescription: any
  // public authDataProfileEmail: any
  @ViewChild(Nav) nav2: Nav;

  constructor(
    public angularFire: AngularFire
  ) {
  }

  respondToAuth(
    authenticatedCallback: any,
    unauthenticatedCallback: any
  ) {
    var thisComponent = this;
    thisComponent.angularFire.auth.subscribe((authData) => {
      if (authData) {
        thisComponent.uid = authData.uid;
        var object = thisComponent.angularFire.database.object( "/users/" + thisComponent.uid, { preserveSnapshot: true });
        object.subscribe( (snapshot) => {
          thisComponent.user = snapshot.value();
          authenticatedCallback();
        });

        // if (authData.provider == 'facebook') {
        //   this.authDataProfileImage  = authData.facebook.profileImageURL.replace(/\_normal/,"");
        //   this.authDataProfileName = authData.facebook.displayName;
        //   this.authDataProfileDescription = authData.facebook.cachedUserProfile.description;
        //   this.authDataProfileEmail = authData.facebook.email;
        // }
      } else {
        thisComponent.uid = undefined;
        thisComponent.user = undefined;
        unauthenticatedCallback();
      }
    });
  }

  sendVerificationSMS(phone: string) {
    return new Promise( (resolve) => {
      console.log("about to queue verification number");
      this.angularFire.database.list( "/phone_verifications" ).push({
        phone: phone,
        createdAt: Firebase.ServerValue.TIMESTAMP
      }).then( () => {
        console.log("verification number queued");
        resolve();
      });
    });
  }

  checkVerificationCode(phone: string, verificationCode: string) {
    return new Promise( (resolve) => {
      var user = {phone: phone, uid: "123", verificationCode: '333444'}; // TODO: look up user by phone in users collection
      var userToReturn = user && user.verificationCode == verificationCode ? user : undefined;
      // thisComponent.uid = user.uid;
      // thisComponent.user = userToReturn;

      resolve(userToReturn);
      // this.angularFire.database.list( "/phone_verifications" ).push({
      //   phone: phone,
      //   createdAt: Firebase.ServerValue.TIMESTAMP
      // }).then( () => {
      //   resolve();
      // });
    });
  }

  isSignedIn() {
    return !!this.uid;
  }

  // saveUser(user) {
  //   if (!user.createdAt) {
  //     user.createdAt = Firebase.ServerValue.TIMESTAMP;
  //   }
  //   var usersRef = this.firebaseRef.child("users");
  //   if (!user.uid) {
  //     user.uid = usersRef.push().key();
  //   }
  //   usersRef.child(user.uid).update(user);
  // }
  //
  // assignMemberId(user, callback) {
  //   console.log('assigning member id');
  //   var usersRef = this.firebaseRef.child("users");
  //   usersRef.once("value", function(snapshot) {
  //     var allUsers = _.values(snapshot.val());
  //     var usersWithMemberId = _.select(allUsers, function(u) { return u.memberId; } );
  //     var lastUserWithMemberId = _.last(_.sortBy( usersWithMemberId, function(u) { return u.memberId; } ) );
  //     var lastMemberId = lastUserWithMemberId ? lastUserWithMemberId.memberId : 0;
  //     var membersNeedingMemberId = _.select(allUsers, function(u) { return !u.memberId && u.signedUpAt });
  //     var numberOfPriorMembersNeedingMemberId = _.select(membersNeedingMemberId, function(u) { return u.uid < user.uid } ).length;
  //     user.memberId = lastMemberId + numberOfPriorMembersNeedingMemberId + 1;
  //     usersRef.child(user.uid).update({memberId: user.memberId});
  //     callback(null, user);
  //   }, function (errorObject) {
  //     console.log("The read failed: " + errorObject.code);
  //     callback(errorObject, user);
  //   });
  // }

}
