import {Injectable, Pipe} from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateAndTime'
})
@Injectable()
export class DateAndTime {

  transform(value: string, args: any[]) {
    if (!value || value.length === 0) {
      return;
    }
    return moment(value).format('D/MM/YY, h:mm a');
  }
}
