 // These methods were missing from node_modules/angularfire2/firebase3.d.ts

declare namespace firebase.database.ServerValue {
  var TIMESTAMP: any;
}
declare namespace firebase.auth {
  interface AuthService {
    createCustomToken(uid: string, options?: any): string;
  }
}
