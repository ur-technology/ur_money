import {Injectable, Pipe} from '@angular/core';
import * as moment from 'moment';

/*
  Generated class for the Timestamp pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'timestamp'
})
@Injectable()
export class Timestamp {
  /*
    Takes a value and makes it realtive time.
   */
  transform(value: string, args: any[]) {
    return moment(value).fromNow();
  }
}
