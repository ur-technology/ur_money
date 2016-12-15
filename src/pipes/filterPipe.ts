import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the FilterPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'filterBy'
})
@Injectable()
export class FilterPipe {

  isMatch(value: string, filter: string) {
    return value.toLocaleLowerCase().indexOf(filter) !== -1;
  }
  transform(value: any, args: string) {
    let filter: string = args ? args.toLocaleLowerCase() : null;
    return filter ? value.filter((data: any) => {
      return this.isMatch(data.name, filter);
    }) : value;
  }
}
