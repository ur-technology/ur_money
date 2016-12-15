import { Pipe, PipeTransform } from "@angular/core";
import * as moment from 'moment';

@Pipe({
  name: 'timestamp'
})
export class Timestamp implements PipeTransform {

  transform(value: string) {
    if (!value || value.length === 0) {
      return;
    }
    return moment(value).fromNow();
  }
}
