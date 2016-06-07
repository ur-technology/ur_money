import {Injectable} from '@angular/core';
import {Auth} from '../../components/auth/auth';

/*
  Generated class for the UserService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UserService {
  constructor(public auth: Auth) {

  }

  createPublicPrivateKeyPair() {
    return new Promise((resolve, reject) => {

    });
  }



}

