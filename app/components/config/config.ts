export class Config {
  constructor() {
  }

  static getEnvironment() {
    return "staging";
  }

  static values() {
    return  {
      production: {
        appDownloadUrl: 'https://www.ur.capital/app',
        firebase: {
          apiKey: "AIzaSyBUGCRu1n2vFgyFgTVhyoRbKz39MsDMvvw",
          authDomain: "ur-money-production.firebaseapp.com",
          databaseURL: "https://ur-money-production.firebaseio.com",
          storageBucket: "ur-money-production.appspot.com",
        }
      },
      staging: {
        appDownloadUrl: 'https://ur-money-staging.firebaseapp.com/app',
        firebase: {
          apiKey: "AIzaSyBUGCRu1n2vFgyFgTVhyoRbKz39MsDMvvw",
          authDomain: "ur-money-staging.firebaseapp.com",
          databaseURL: "https://ur-money-staging.firebaseio.com",
          storageBucket: "ur-money-staging.appspot.com"
        }
      },
      john: {
        appDownloadUrl: 'https://ur-money-john.firebaseapp.com/app',
        firebase: {
          apiKey: "AIzaSyAmnXqJs5-fOzCQdhA38aEY5ZFxVmeNf0g",
          authDomain: "ur-money-john.firebaseapp.com",
          databaseURL: "https://ur-money-john.firebaseio.com",
          storageBucket: "ur-money-john.appspot.com"
        }
      },
      xavier: {
        appDownloadUrl: 'https://ur-money-xavier.firebaseapp.com/app',
        firebase: {
          apiKey: "set this up at firebase.com",  // TODO: set up credentials for Xavier
          authDomain: "ur-money-xavier.firebaseapp.com",
          databaseURL: "https://ur-money-xavier.firebaseio.com",
          storageBucket: "ur-money-xavier.appspot.com"
        }
      }
    }[Config.getEnvironment()];
  }
}
