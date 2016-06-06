import {Injectable, Pipe} from '@angular/core';
import * as _ from 'lodash';

/*
  Generated class for the OrderBy pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'orderBy'
})
@Injectable()
export class OrderBy {
  /*
    Takes a value Contvert to order By.
   */
  transform(array: any[], args: any[]) {
    return _.orderBy(array, args);
  }
}
