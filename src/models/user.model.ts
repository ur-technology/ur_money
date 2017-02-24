import { FirebaseModel } from './firebase-model';
import * as _ from 'lodash';

export class UserModel extends FirebaseModel {
  static _containerPath = 'users';

  admin: boolean;
  address: string;
  city: string;
  email: string;
  countryCode: string;
  downlineLevel: number;
  firstName: string;
  middleName: string;
  lastName: string;
  name: string;
  phone: string;
  profilePhotoUrl: string;
  referralCode: string;
  wallet: any;
  registration: any;
  sponsor: any
  disabled: boolean;
  settings: any;
  invitesDisabled: boolean;
  idUploaded: boolean;

  static fullName(user: any) {
    return _.trim(`${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`).replace(/  /, ' ');
  }

  static getUserModelOnlyWithSimpleFields(key: string): Promise<UserModel> {
    return new Promise((successCallback, rejectCallback) => {
      super.getObjectWithSpecificFields(`${UserModel._containerPath}/${key}`, ['admin', 'address', 'city', 'countryCode', 'downlineLevel', 'email', 'firstName', 'lastName', 'middleName', 'name', 'phone', 'profilePhotoUrl', 'referralCode', 'wallet', 'registration', 'disabled', 'settings', 'idUploaded']).then(resultObject => {
        let result = new UserModel();
        result.key = key;
        result.fillFields(resultObject);
        successCallback(result);
      });
    });
  }

  update(newValues: Object): Promise<any> {
    return new Promise((successCallback, rejectCallback) => {
      super.update(UserModel._containerPath, newValues).then(value => {
        this.fillFields(newValues);
        successCallback();
      });
    });

  }


}
