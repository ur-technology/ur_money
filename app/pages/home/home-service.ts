import {Injectable, EventEmitter} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {Auth} from '../../components/auth/auth';

/*
  Generated class for the HomeService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class HomeService {
  public loadUREmitter = new EventEmitter();

  constructor(public http: Http, public auth: Auth) {
  }

  loadUR() {
    return new Promise((resolve, reject) => {

      this.auth.firebaseRef().onAuth((authData) => {
        if (authData) {
          let getUserDataRef = this.auth.firebaseRef().child("users").child(authData.uid);
          getUserDataRef.on('value', (snapshot) => {
            let user = snapshot.val();
            if (user && user.wallet) {
              let walletData = user.wallet;
              this.loadUREmitter.emit(walletData);
              resolve(walletData);
            } else {
              resolve({});
            }
          });
        }
      });
    });
  }

  loadMessages() {
    return new Promise(resolve => {
      let messages = [
        {
          sender: 'John',
          body: 'This is dummy text',
          timestamp: '2016-06-06T1:53:46.041Z'
        },
        {
          sender: 'Rob',
          body: 'This is dummy text. This is dummy text.',
          timestamp: '2016-06-06T10:53:46.041Z'
        },
        {
          sender: 'Ras',
          body: 'This is dummy text. This is dummy text.',
          timestamp: '2016-06-06T12:53:46.041Z'
        },
        {
          sender: 'Bas',
          body: 'This is dummy text. This is dummy text.',
          timestamp: '2016-06-06T11:53:46.041Z'
        },
        {
          sender: 'new',
          body: 'This is dummy text. This is dummy text.',
          timestamp: '2016-06-06T19:53:46.041Z'
        }
      ];

      resolve(messages);
    });
  }
  

  
  
  
  
  
}

