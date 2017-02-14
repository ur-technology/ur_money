// These methods were missing from node_modules/angularfire2/firebase3.d.ts

declare namespace firebase.database.ServerValue {
  /* tslint:disable */
  //var TIMESTAMP: any;
  /* tslint:enable */
}
declare namespace firebase.auth {
  interface AuthService {
    createCustomToken(uid: string, options?: any): string;
  }
}
