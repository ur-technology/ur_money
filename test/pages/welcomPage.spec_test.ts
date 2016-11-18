import {beforeEachProviders, it, describe, expect, inject} from '@angular/core/testing';
import {provide} from '@angular/core';
import {NavController, Platform, ModalController} from 'ionic-angular';
import {defaultDB, configDB} from '../initDB';
import {WelcomePage} from '../../app/pages/registration/welcome';
import {FIREBASE_PROVIDERS, AngularFire} from 'angularfire2';
import {AuthService} from '../../app/services/auth';
import {ContactsService} from '../../app/services/contacts';

import {NavMock} from '../mocks/Nav';
import {PlatformMock} from '../mocks/Platform';
import {ModalControllerMock} from '../mocks/ModalController';

describe('WelcomePage', () => {

    beforeEachProviders(() => [
        WelcomePage,
        AuthService,
        ContactsService,
        FIREBASE_PROVIDERS,
        defaultDB,
        configDB,
        AngularFire,
        provide(NavController, { useValue: NavMock }),
        provide(Platform, { useValue: PlatformMock }),
        provide(ModalController, { useClass : ModalControllerMock })
    ]);

    it('check welcome page dependency', inject([WelcomePage], (welcomePage) => {
        // Expectations
        expect(false).toBeFalsy();

    }));

});