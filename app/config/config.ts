// NOTE: to define new config values or override the defaults, create a file 'env.json'
// in this difrectory with the following contents:
// {
//   generalAppDownloadUrl: 'http://myfavoritydownwonloadurl/app',
//   firebaseProjectId: 'ur-money-newguy',
//   // ...
// }

import * as _ from 'lodash';
import * as log from 'loglevel';

export let Config: any = require('./env'); // TODO: figure out how to respond gracefully when there is no env.json file
_.defaults(Config, {
  version: '1.0.0 (21-Sep-2016 08:35 PM CT)',
  generalAppDownloadUrl: 'http://ur-money-staging.firebaseapp.com/app',
  iosAppDownloadUrl: 'https://i.diawi.com/1GWB7o',
  androidAppDownloadUrl: 'https://i.diawi.com/TaovaP',
  firebaseProjectId: 'ur-money-staging',
  logLevel: 'debug'
});

let firebaseValues = {
  'ur-money-john': {
    apiKey: 'AIzaSyAmnXqJs5-fOzCQdhA38aEY5ZFxVmeNf0g',
    authDomain: 'ur-money-john.firebaseapp.com',
    databaseURL: 'https://ur-money-john.firebaseio.com',
    storageBucket: 'ur-money-john.appspot.com'
  },
  'ur-money-xavier': {
    apiKey: 'AIzaSyD6k2eb820GcuTOZk4usrADSu8gaJmsNkw',
    authDomain: 'ur-money-xavier.firebaseapp.com',
    databaseURL: 'https://ur-money-xavier.firebaseio.com',
    storageBucket: 'ur-money-xavier.appspot.com'
  },
  'ur-money-staging': {
    apiKey: 'AIzaSyBUGCRu1n2vFgyFgTVhyoRbKz39MsDMvvw',
    authDomain: 'ur-money-staging.firebaseapp.com',
    databaseURL: 'https://ur-money-staging.firebaseio.com',
    storageBucket: 'ur-money-staging.appspot.com'
  },
  'ur-money-production': {
    apiKey: 'AIzaSyBUGCRu1n2vFgyFgTVhyoRbKz39MsDMvvw',
    authDomain: 'ur-money-production.firebaseapp.com',
    databaseURL: 'https://ur-money-production.firebaseio.com',
    storageBucket: 'ur-money-production.appspot.com',
  },
};

Config.firebase = firebaseValues[Config.firebaseProjectId];
if (!Config.firebase) {
  log.error(`firebaseProjectId ${Config.firebaseProjectId} not recognized! - please update env.json`);
}
