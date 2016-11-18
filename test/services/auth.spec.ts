import {beforeEachProviders, it, describe, expect, inject} from '@angular/core/testing';
import {provide} from '@angular/core';
import {Platform} from 'ionic-angular';
import {defaultDB, configDB} from '../initDB';
import {FIREBASE_PROVIDERS, AngularFire} from 'angularfire2';

import {AuthService} from '../../app/services/auth';
import {ContactsService} from '../../app/services/contacts';

import {PlatformMock} from '../mocks/Platform';

describe('Auth service', () => {

    beforeEachProviders(() => [
        provide(Platform, { useValue: PlatformMock }),
        FIREBASE_PROVIDERS,
        defaultDB,
        configDB,
        AngularFire,
        ContactsService,
        AuthService
    ]);

    it('check auth service dependency', inject([AuthService, AngularFire], (authService, angularFire) => {
        // Expectations
        // expect(false).toBeFalsy();

        return authService.checkFirebaseConnection().then(
            ()=>{
                console.log("success");
                done();
            },
            ()=>{
                console.log("error");
                done();
            }
        );
    }));

});