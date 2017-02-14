import { Injectable, Pipe } from '@angular/core';
import { round } from 'lodash';

/*
  Generated class for the Round pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'round'
})
@Injectable()
export class Round {
  /*
    Takes a value and makes it lowercase.
   */
  transform(value: string, args: any[]) {
    if (value) {
      let convertToNumber = Number(value); // make sure it's a Number
      return round(convertToNumber, 2);
    } else {
      return 0;
    }
  }
}
