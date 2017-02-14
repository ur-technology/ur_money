import { Injectable, Pipe } from '@angular/core';
import * as _ from 'lodash';
import * as log from 'loglevel';

@Pipe({
  name: 'orderBy'
})
@Injectable()
export class OrderBy {
  /*
    Takes a value Contvert to order By.
   */
  transform(array: any[], args: any[]) {
    log.trace(_.orderBy(array, args[0]));
    return _.orderBy(array, args[0]);
  }
}
