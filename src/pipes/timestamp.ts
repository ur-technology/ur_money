import {Injectable, Pipe} from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'timestamp'
})
@Injectable()
export class Timestamp {

  transform(value: string, args: any[]) {
    if (!value || value.length === 0) {
      return;
    }
    return moment(value).fromNow();
  }
}
