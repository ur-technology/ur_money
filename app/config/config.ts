import * as _ from 'lodash';

export class ConfigInitializer {
  constructor() {
  }

  public static env() {
    return "dev"; // choose one of dev / staging / production
  }

  public static firebaseProjectId(): string {
    return "ur-money-john"; // choose one of ur-money-john / ur-money-xavier / ur-money-staging / ur-money-production
  }

  public static allValues() {
    let values: any = ConfigInitializer.baseValues();
    return _.extend(values, {
      env: ConfigInitializer.env(),
      firebaseProjectId: ConfigInitializer.firebaseProjectId(),
      firebase: ConfigInitializer.firebaseValues()
    });
  }

  public static baseValues() {
    return {
      dev: {
        appDownloadUrl: 'http://localhost:8100/app',
        // put other values here
      },
      staging: {
        appDownloadUrl: 'https://ur-money-staging.fireaseapp.com/app',
        // put other values here
      },
      production: {
        appDownloadUrl: 'https://www.urcapital.io/app',
        // put other values here
      }
    }[ConfigInitializer.env()];
  }

  public static firebaseValues() {
    return {
      "ur-money-john": {
        apiKey: "AIzaSyAmnXqJs5-fOzCQdhA38aEY5ZFxVmeNf0g",
        authDomain: "ur-money-john.firebaseapp.com",
        databaseURL: "https://ur-money-john.firebaseio.com",
        storageBucket: "ur-money-john.appspot.com"
      },
      "ur-money-xavier": {
        apiKey: "AIzaSyD6k2eb820GcuTOZk4usrADSu8gaJmsNkw",
        authDomain: "ur-money-xavier.firebaseapp.com",
        databaseURL: "https://ur-money-xavier.firebaseio.com",
        storageBucket: "ur-money-xavier.appspot.com"
      },
      "ur-money-staging": {
        apiKey: "AIzaSyBUGCRu1n2vFgyFgTVhyoRbKz39MsDMvvw",
        authDomain: "ur-money-staging.firebaseapp.com",
        databaseURL: "https://ur-money-staging.firebaseio.com",
        storageBucket: "ur-money-staging.appspot.com"
      },
      "ur-money-production": {
        apiKey: "AIzaSyBUGCRu1n2vFgyFgTVhyoRbKz39MsDMvvw",
        authDomain: "ur-money-production.firebaseapp.com",
        databaseURL: "https://ur-money-production.firebaseio.com",
        storageBucket: "ur-money-production.appspot.com",
      },
    }[ConfigInitializer.firebaseProjectId()];
  }

}

export let Config: any = ConfigInitializer.allValues();
