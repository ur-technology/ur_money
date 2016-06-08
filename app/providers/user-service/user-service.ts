import {Injectable} from '@angular/core';
import {Auth} from '../../components/auth/auth';
import {BarcodeScanner} from 'ionic-native';

declare var cordova: any;
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

  createQRCodeAndSave(userId: any) {
    if (cordova.plugins && cordova.plugins.barcodeScanner) {
      cordova.plugins.barcodeScanner.encode(cordova.plugins.barcodeScanner.Encode.TEXT_TYPE, userId, (success) => {
        console.log(success);
      }, (fail) => {
        console.log(fail);
      });
    }
  }

}

