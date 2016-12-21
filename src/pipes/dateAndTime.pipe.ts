
import { Pipe, PipeTransform } from "@angular/core";
import * as moment from 'moment';

@Pipe({
  name: 'dateAndTime'
})
export class DateAndTime implements PipeTransform {

  transform(value: string) : string {
    if (!value || value.length === 0) {
      return;
    }
    return moment(value).format('D/MMM/YYYY, h:mm a');
  }
}
