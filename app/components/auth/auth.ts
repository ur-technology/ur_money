import {Injectable, ViewChild} from '@angular/core'
import {Nav} from 'ionic-angular';
import {AngularFire} from 'angularfire2'
import {Component} from '@angular/core';
import * as _ from 'underscore'
import * as Firebase from 'firebase'

@Injectable()

export class Auth {
  public uid: string
  public user: any
  // public authDataProfileImage: any
  // public authDataProfileName: any
  // public authDataProfileDescription: any
  // public authDataProfileEmail: any

  constructor(
    public angularFire: AngularFire
  ) {

  }

  static firebaseUrl() {
    // TODO: this will work only for webapp, not for mobile app -- need to fix this
    return (window.location.hostname == "signup.ur.capital") ? "https://urcapital-production.firebaseio.com/" : 'https://blinding-torch-3730.firebaseio.com/';
  }

  firebaseRef() {
    return new Firebase(Auth.firebaseUrl());
  }
  /*
  Methods for respondToAuth
  */
  respondToAuth() {
    return new Promise((resolve, reject) => {
      this.firebaseRef().onAuth( (authData) => {
        if (authData) {
          this.firebaseRef().child("users").child(authData.uid).once("value").then((snapshot) => {
            this.uid = authData.uid;
            this.user = snapshot.val();
            // if (authData.provider == 'facebook') {
            //   this.profileImage  = authData.facebook.profileImageURL.replace(/\_normal/,"");
            //   this.profileName = authData.facebook.displayName;
            //   this.profileDescription = authData.facebook.cachedUserProfile.description;
            //   this.profileEmail = authData.facebook.email;
            // }
            resolve();
          });
        } else {
          this.uid = undefined;
          this.user = undefined;
          reject();
        }
      });
    });
  }

  /*

  Methods for the Phone verification
  */
  requestPhoneVerification(phone: string) {
    return new Promise((resolve) => {
      console.log("about to queue verification number");
      var phoneVerificationRef = this.firebaseRef().child("phoneVerifications").push({
        phone: phone,
        createdAt: Firebase.ServerValue.TIMESTAMP
      });
      console.log("verification queued");
      phoneVerificationRef.on("value", (snapshot) => {
        var phoneVerification = snapshot.val();
        console.log(phoneVerification);
        if (!_.isUndefined(phoneVerification.smsSuccess)) {
          console.log("resolving promise");
          phoneVerificationRef.off("value"); // stop watching for changes on this phone verification
          resolve({ phoneVerificationKey: phoneVerificationRef.key(), smsSuccess: phoneVerification.smsSuccess });
        }
      });
    });
  }

  /*
  Methods used for verfication check
  */
  checkVerificationCode(phoneVerificationKey: string, attemptedVerificationCode: string) {

    return new Promise((resolve) => {
      var phoneVerificationRef = this.firebaseRef().child("phoneVerifications").child(phoneVerificationKey);
      phoneVerificationRef.child("attemptedVerificationCode").set(attemptedVerificationCode).then(() => {
        phoneVerificationRef.on("value", (snapshot) => {
          var stopWatchingPhoneVerificationAndResolvePromise = function (success) {
            phoneVerificationRef.off("value"); // stop watching for changes on this phone verification
            resolve(success);
          };

          var phoneVerification = snapshot.val();
          if (_.isUndefined(phoneVerification.verificationSuccess)) {
            // verificationSuccess still not set
            return;
          }

          if (phoneVerification.verificationSuccess) {
            this.firebaseRef().authWithCustomToken(phoneVerification.authToken, (error, authData) => {
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

  /*
  Used to check wheater signed or not
  */
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
