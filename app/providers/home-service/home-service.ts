import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the HomeService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class HomeService {
  constructor(public http: Http) {

  }

  loadUR() {
    return new Promise(resolve => {
      let homeData = {
        current_ur_holdings: { quantity: 2000.0, updatedAt: 1465163554610 },
        historical_ur_holdings: {
          '-KJXYAfyakGRJMLs-e1t': { quantity: 2000.0, updatedAt: 1465163554610 },
          '-KJXYAfyakGRJMLs-e2t': { quantity: 200.0, updatedAt: 1465163554620 },
          '-KJXYAfyakGRJMLs-e3t': { quantity: 50.0, updatedAt: 1465163554630 },
          '-KJXYAfyakGRJMLs-e4t': { quantity: 1800.0, updatedAt: 1465163554640 }
        }
      };
      resolve(homeData);
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

