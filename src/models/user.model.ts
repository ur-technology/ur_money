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
  notifications: any;
  invitesDisabled: boolean;
  idUploaded: boolean;
  selfieMatched: boolean;
  idRecognitionStatus: string;
  selfieMatchStatus: string;
  signUpBonusApproved: boolean;

  static fullName(user: any) {
    return _.trim(`${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`).replace(/  /, ' ');
  }

  static getUserModelOnlyWithSimpleFields(key: string): Promise<UserModel> {
    return new Promise((successCallback, rejectCallback) => {
      super.getObjectWithSpecificFields(`${UserModel._containerPath}/${key}`, [
        'admin',
        'address',
        'city',
        'countryCode',
        'downlineLevel',
        'email',
        'firstName',
        'lastName',
        'middleName',
        'name',
        'phone',
        'profilePhotoUrl',
        'referralCode',
        'wallet',
        'registration',
        'disabled',
        'notifications',
        'settings',
        'idUploaded',
        'selfieMatched',
        'selfieConfidence',
        'idRecognitionStatus',
        'selfieMatchStatus',
        'signUpBonusApproved'
      ]).then(resultObject => {
        let result = new UserModel();
        result.key = key;
        result.fillFields(resultObject);
        successCallback(result);
      });
    });
  }

  update(newValues: Object): Promise<any> {
    return new Promise((successCallback, rejectCallback) => {
      super.update(`${UserModel._containerPath}/${this.key}`, newValues).then(value => {
        this.fillFields(newValues);
        successCallback();
      });
    });
  }

  updateNotifications(newValues: Object): Promise<any> {
    return new Promise((successCallback, rejectCallback) => {
      super.update(`${UserModel._containerPath}/${this.key}/notifications`, newValues).then(value => {
        this.fillFields(newValues, { branch: 'notifications' });
        successCallback();
      });
    });
  }

  checkIfPasswordCorrect(password): Promise<string> {
    return new Promise((resolve, reject) => {
      let taskRef;
      taskRef = FirebaseModel.ref(`/userQueue/tasks`).push({ userId: this.key, clientHashedPassword: password, _state: 'user_check_password_requested' });
      let resultRef = taskRef.child('result');
      resultRef.on('value', (snapshot) => {
        let taskResult = snapshot.val();
        if (!taskResult) {
          return;
        }
        resultRef.off('value');
        if (taskResult.error) {
          reject(taskResult.error);
          return;
        } else {
          taskRef.remove();
          resolve(taskResult.state)
        }
      }, (error) => {
        reject(error);
      });
    });
  }

  changeCurrentPassword(password): Promise<string> {
    return new Promise((resolve, reject) => {
      let taskRef;
      taskRef = firebase.database().ref(`/userQueue/tasks`).push({ userId: this.key, clientHashedPassword: password, _state: 'user_password_change_requested' });
      let resultRef = taskRef.child('result');
      resultRef.on('value', (snapshot) => {
        let taskResult = snapshot.val();
        if (!taskResult) {
          return;
        }
        resultRef.off('value');
        if (taskResult.error) {
          reject(taskResult.error);
          return;
        } else {
          taskRef.remove();
          resolve(taskResult.state)
        }
      }, (error) => {
        reject(error);
      });
    });
  }

  isVerified(): boolean {
    // This may need to be improved eventually. The legacy data uses
    // signUpBonusApproved to indicate that a user is approved in a
    // general sense (that is, we don't think they're a fraudster).
    // The automatic ID verification sets this flag, and so does the
    // user management system, so it seems reasonable to use it as
    // an indication of ID verifications – even if it's misnamed.
    return this.signUpBonusApproved;
  }
}
