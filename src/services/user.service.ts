import {Injectable, Inject} from '@angular/core';
import { FirebaseApp } from 'angularfire2';
import {UserModel}  from '../models/user.model';

@Injectable()
export class UserService {
  constructor( @Inject(FirebaseApp) firebase: any) {

  }

  getCurrentUser(currentUserId: string): Promise<UserModel> {
    return new Promise((resolveCallback, rejectCallback) => {
      UserModel.getUserModelOnlyWithSimpleFields(currentUserId).then((user: UserModel) => {
        resolveCallback(user);
      }, (error) => {
        rejectCallback(error);
      });
    });
  }

}
