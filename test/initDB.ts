import {FIREBASE_PROVIDERS, defaultFirebase, firebaseAuthConfig, AuthProviders, AuthMethods, AngularFire} from 'angularfire2';
import {Config} from '../app/config/config';

export var defaultDB = defaultFirebase({
    apiKey: Config.firebaseApiKey,
    authDomain: `${Config.firebaseProjectId}.firebaseapp.com`,
    databaseURL: `https://${Config.firebaseProjectId}.firebaseio.com`,
    storageBucket: `${Config.firebaseProjectId}.appspot.com`
});
export var configDB = firebaseAuthConfig({
    provider: AuthProviders.Custom, method: AuthMethods.CustomToken, remember: 'default' // scope: ['email']
});