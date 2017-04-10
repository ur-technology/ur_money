import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'urFormat'
})
@Injectable()
export class UrFormat {
  /*
    Takes a value and format it as currency.
   */
  transform(value: string, args: any[]) {
    if (value) {
      let convertToNumber = Number(value);
      return new Intl.NumberFormat().format(convertToNumber);
    } else {
      return '0';
    }
  }
}
