import {Injectable, ViewChild} from '@angular/core'
import {Nav} from 'ionic-angular';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable, AuthProviders, AuthMethods} from 'angularfire2'
import {Component} from '@angular/core';
import * as _ from 'underscore'
import * as lodash from 'lodash';
import * as Firebase from 'firebase';
import { Subject } from 'rxjs/Subject';

@Injectable()

export class Auth {
    public uid: string
    public user: FirebaseObjectObservable<any>;
    public userRef: any
    public phoneVerfificationSubject: Subject<any>;

    // public authDataProfileImage: any
    // public authDataProfileName: any
    // public authDataProfileDescription: any
    // public authDataProfileEmail: any

    constructor(public angularFire: AngularFire) {
    }

    static firebaseUrl() {
        // TODO: this will work only for webapp, not for mobile app -- need to fix this
        if (/ur\.capital$|urcapital-production\.firebaseapp\.com$/.test(window.location.hostname)) {
            return "https://urcapital-production.firebaseio.com/";
        } else {
            return "https://blinding-torch-3730.firebaseio.com/";
        }
    }

    firebaseRef() {
        return new Firebase(Auth.firebaseUrl());
    }
    /*
    Methods for respondToAuth
    */
    respondToAuth(nav: Nav, authPage: any, unauthPage: any) {
        this.angularFire.auth.subscribe((authData) => {
            if (authData) {
                this.uid = authData.uid;
                this.userRef = `/users/${this.uid}`;
                this.user = this.angularFire.database.object(this.userRef);
                nav.setRoot(authPage);
            } else {
                this.uid = undefined;
                this.user = undefined;
                nav.setRoot(unauthPage);
            }
        });
    }

    /*
  
    Methods for the Phone verification
    */
    requestPhoneVerification(phone: string) {
        return new Promise((resolve) => {
            console.log('about to queue verification number');

            var phoneVerificationRefrecence = this.angularFire.database.list('/phoneVerifications', { preserveSnapshot: true }).push({
                phone: phone,
                createdAt: Date.parse(new Date().toISOString())
            });
            console.log("verification queued");
            phoneVerificationRefrecence.on('value', (snapshot) => {
                console.log(snapshot);
                var phoneVerification = snapshot.val();
                console.log(phoneVerification);
                if (!_.isUndefined(phoneVerification.smsSuccess)) {
                    console.log("resolving promise");
                    phoneVerificationRefrecence.off('value'); // stop watching for changes on this phone verification
                    resolve({ phoneVerificationKey: phoneVerificationRefrecence.key(), smsSuccess: phoneVerification.smsSuccess, smsError: phoneVerification.smsError });
                }
            });
        });
    }

    /*
    Methods used for verfication check
    */
    checkVerificationCode(phoneVerificationKey: string, attemptedVerificationCode: string) {

        return new Promise((resolve) => {

            var phoneVerificationRefrecence = this.angularFire.database.list(`/phoneVerifications`);
            phoneVerificationRefrecence.update(
                phoneVerificationKey, { attemptedVerificationCode: attemptedVerificationCode });
            phoneVerificationRefrecence.subscribe((snapshot) => {
                let phoneVerification: any;
                phoneVerification = lodash.find(snapshot, { '$key': phoneVerificationKey });
                if (!phoneVerification || !phoneVerification.verificationSuccess) {
                    // verificationSuccess still not set
                    return;
                }

                if (phoneVerification.verificationSuccess) {
                    this.angularFire.auth.login({ token: phoneVerification.authToken }, (error, authData) => {
                        console.log('Authentication succeded: ' + !error);
                        stopWatchingPhoneVerificationAndResolvePromise(!error);
                    });
                } else {
                    stopWatchingPhoneVerificationAndResolvePromise(false);
                }

                function stopWatchingPhoneVerificationAndResolvePromise(success) {
                    // phoneVerificationRefrecence.off('value'); // stop watching for changes on this phone verification
                    if (success) {
                        phoneVerificationRefrecence.remove(phoneVerificationKey);
                    }
                    resolve(success);
                }
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
