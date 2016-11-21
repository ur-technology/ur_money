import {beforeEachProviders, it, describe, expect, inject, async, tick, fakeAsync, beforeEach} from '@angular/core/testing';
import {provide} from '@angular/core';
import {Platform} from 'ionic-angular';
import {defaultDB, configDB} from '../initDB';
import {FIREBASE_PROVIDERS, AngularFire} from 'angularfire2';
import * as firebase from 'firebase';

import {AuthService} from '../../app/services/auth';
import {ContactsService} from '../../app/services/contacts';

import {PlatformMock} from '../mocks/Platform';
import {NavMock} from '../mocks/Nav';

describe('Auth service', () => {

    let auth, fireBase;

    beforeEachProviders(() => [
        provide(Platform, { useValue: PlatformMock }),
        FIREBASE_PROVIDERS,
        defaultDB,
        configDB,
        AngularFire,
        ContactsService,
        AuthService
    ]);

    beforeEach(inject([AuthService, AngularFire], (authService: AuthService, angularFire: AngularFire) => {
        auth = authService;
        fireBase = angularFire;
    }));

    // it('check connection', (done) => {
    //     auth.checkFirebaseConnection().then(
    //         ()=>{
    //             expect(true).toBeTruthy();
    //             done();
    //         },
    //         ()=>{
    //             expect(false).toBeTruthy();
    //             done();
    //         }
    //     );
    // });

    let config = {
        registration : {
            phone : '+16197778007',
            code : '+1',
            sms : '923239'
        },
        existed : {
            phone : '+375447785468',
            code : '+375',
            sms : '923239'
        },
        notExisted : {
            phone : '+375257387284',
            code : '+375'
        },
        notSupported : {
            phone : '+77711241193',
            code : '+7'
        }
    };

    it('phone verification. registration', (done) => {
        let nav = new NavMock();

        console.log(auth.isSignedIn(), "SIGNED");

        auth.requestPhoneVerification(config.registration.phone, '111111')
            .then(((taskState: string)=>{

                //Check if sms send
                expect(taskState).toBe('code_generation_completed_and_sms_sent');

                console.log("code send");

                spyOn(nav, 'setRoot').and.callFake(page => {

                    console.log(page);
                    //Successful authorization redirects to home page
                    // expect(page).toBe('homePage');
                    done();
                });

                auth.respondToAuth(nav, {
                    'introPage'                 : 'introPage',
                    'verificationPendingPage'   : 'verificationPendingPage',
                    'verificationFailedPage'    : 'verificationFailedPage',
                    'homePage'                  : 'homePage',
                    'walletSetupPage'           : 'walletSetupPage',
                    'welcomePage'               : 'welcomePage'
                });

                return auth.checkVerificationCode(config.registration.sms);
            }))
            .then((result)=>{
                console.log("code match");
                //Sent code is correct
                expect(typeof result).toBe('object');
                expect(result.codeMatch).toBe(true);
            });

    });

    // it('phone verification. existed', (done) => {
    //     let nav = new NavMock();
    //
    //     spyOn(nav, 'setRoot').and.callFake(page => {
    //
    //         //Successful authorization redirects to home page
    //         expect(page).toBe('homePage');
    //
    //         //Check if logged
    //         expect(auth.isSignedIn()).toBe(true);
    //
    //         firebase.database().ref(`/users/${auth.currentUserId}`).once('value', snapshot=>{
    //             auth.reloadCurrentUser().then(()=>{
    //
    //                 //Reload user
    //                 expect(JSON.stringify(snapshot.val())).toBe(JSON.stringify(auth.currentUser));
    //                 done();
    //             });
    //         });
    //     });
    //
    //     auth.respondToAuth(nav, {
    //         'homePage' : 'homePage'
    //     });
    //
    //     auth.requestPhoneVerification(config.existed.phone, config.existed.code)
    //         .then(((taskState: string)=>{
    //
    //             //Check if sms send
    //             expect(taskState).toBe('code_generation_completed_and_sms_sent');
    //
    //             return auth.checkVerificationCode('000000');
    //         }))
    //         .then((result)=>{
    //
    //             //Sent code is not correct
    //             expect(typeof result).toBe('object');
    //             expect(result.codeMatch).toBe(false);
    //             return auth.checkVerificationCode(config.existed.sms);
    //         })
    //         .then((result)=>{
    //
    //             //Sent code is correct
    //             expect(typeof result).toBe('object');
    //             expect(result.codeMatch).toBe(true);
    //         });
    //
    // });

    // it('phone verification. not existed', (done) => {
    //     auth.requestPhoneVerification(config.notExisted.phone, config.notExisted.code).then(((taskState: string)=>{
    //         expect(taskState).toBe('code_generation_canceled_because_user_not_invited');
    //         done();
    //     }));
    // });

    // it('phone verification. existed but country not supported', (done) => {
    //     auth.requestPhoneVerification(config.notExisted.phone, config.notExisted.code).then(((taskState: string)=>{
    //         expect(taskState).toBe('code_generation_canceled_because_user_not_invited');
    //         done();
    //     }));
    // });

    // it('check connection', (done) => {
    //     done();
    // });

});