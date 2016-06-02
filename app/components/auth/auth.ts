import {Injectable, ViewChild} from '@angular/core'
import {Nav} from 'ionic-angular';
import {AngularFire} from 'angularfire2'
import {Component} from '@angular/core';
import * as _ from 'underscore'
import * as Firebase from 'firebase'
import {Welcome1Page} from '../../pages/welcome/welcome1';
import {Welcome4Page} from '../../pages/welcome/welcome4';
import {HomePage} from '../../pages/home/home';

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

  static firebaseUrl() {
    return 'https://urcapital-production.firebaseio.com/';
  }

  static firebaseRef() {
    return new Firebase(Auth.firebaseUrl());
  }

  respondToAuth(nav: Nav) {
    var thisComponent = this;
    thisComponent.angularFire.auth.subscribe((authData) => {
      if (authData) {
        thisComponent.uid = authData.uid;
        var object = thisComponent.angularFire.database.object( "/users/" + thisComponent.uid, { preserveSnapshot: true });
        object.subscribe( (snapshot) => {
          thisComponent.user = snapshot.val();
          nav.setRoot(thisComponent.user.onboardingComplete ? HomePage : Welcome4Page);
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
        nav.setRoot(Welcome1Page);
      }
    });
  }

  requestPhoneVerification(phone: string) {
    return new Promise( (resolve) => {
      console.log("about to queue verification number");
      var phoneVerificationRef = Auth.firebaseRef().child("phoneVerifications").push({
        phone: phone,
        createdAt: Firebase.ServerValue.TIMESTAMP
      });
      console.log("verification queued");
      phoneVerificationRef.on("value", (snapshot) => {
        var phoneVerification = snapshot.val();
        if (!_.isUndefined(phoneVerification.smsSuccess)) {
          console.log("resolving promise");
          phoneVerificationRef.off("value"); // stop watching for changes on this phone verification
          resolve({phoneVerificationKey: phoneVerificationRef.key(), smsSuccess: phoneVerification.smsSuccess});
        }
      });
    });
  }

  checkVerificationCode(phoneVerificationKey: string, attemptedVerificationCode: string) {

    return new Promise( (resolve) => {
      var phoneVerificationRef = Auth.firebaseRef().child("phoneVerifications").child(phoneVerificationKey);
      phoneVerificationRef.child("attemptedVerificationCode").set(attemptedVerificationCode).then( (xxx) => {
        phoneVerificationRef.on("value", (snapshot) => {
          var stopWatchingPhoneVerificationAndResolvePromise = function(success) {
            phoneVerificationRef.off("value"); // stop watching for changes on this phone verification
            resolve(success);
          };

          var phoneVerification = snapshot.val();
          if (_.isUndefined(phoneVerification.verificationSuccess)) {
            // verificationSuccess still not set
            return;
          }

          if (phoneVerification.verificationSuccess) {
            Auth.firebaseRef().authWithCustomToken(phoneVerification.authToken, function(error, authData) {
              console.log("Authentication succeded: " + !error);
              stopWatchingPhoneVerificationAndResolvePromise(!error);
            });
          } else {
            stopWatchingPhoneVerificationAndResolvePromise(false);
          }
        });
      });
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
