import * as log from 'loglevel';
import * as firebase from 'firebase';
import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';


@Injectable()
export class UserService {
  constructor() {}

  getCurrentUser(currentUserId: string): Promise<UserModel> {
    return new Promise((resolve, reject) => {
      UserModel.getUserModelOnlyWithSimpleFields(currentUserId).then((user: UserModel) => {
        resolve(user);
      }, (error) => {
        reject(error);
      });
    });
  }

  checkEmailUniqueness(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const taskRef = firebase
        .database()
        .ref(`/checkEmailUniquenessQueue/tasks`)
        .push({
          _state: 'check_email_uniqueness_requested',
          email
        });
      const resultRef = taskRef.child('result');

      resultRef.on('value', (snapshot) => {
        let taskResult = snapshot.val();

        if (!taskResult) {
          return;
        }

        resultRef.off('value');
        taskRef.remove();

        if (taskResult.error) {
          log.error(`check email uniqueness error: ${taskResult.error}`);
          reject(taskResult.error);
        } else {
          resolve(taskResult.isUnique);
        }
      }, (error) => {
        reject(error);
      });
    });
  }

  getReferrals(userId: string){
    return new Promise((resolve, reject)=>{
      const taskRef = firebase
      .database()
      .ref('userQueue/tasks')
      .push({
        _state: 'user_referrals_requested',
        userId
      });

      const resultRef = taskRef.child('result');

      resultRef.on('value', (snapshot)=>{
        let taskResult = snapshot.val();

        if(!taskResult) {
          return;
        }
        resultRef.off('value');
        taskRef.remove();
        if (taskResult.state === 'user_referrals_succeeded') {
          resolve(taskResult.referrals);
        } else {
          resolve({});
        }

      });
    });
  }

  searchRecipients(currentUserId: string, searchText: string){
    return new Promise((resolve, reject)=>{
      const taskRef = firebase
      .database()
      .ref('userQueue/tasks')
      .push({
        _state: 'search_recipients_requested',
        userId: currentUserId,
        searchText: searchText
      });

      const resultRef = taskRef.child('result');

      resultRef.on('value', (snapshot)=>{
        let taskResult = snapshot.val();

        if(!taskResult) {
          return;
        }
        resultRef.off('value');
        taskRef.remove();
        if (taskResult.state === 'search_recipients_succeeded') {
          resolve(taskResult);
        } else {
          resolve(null);
        }

      });
    });
  }

}
