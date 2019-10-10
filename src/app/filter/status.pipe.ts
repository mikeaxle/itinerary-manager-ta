import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'statusFilter', pure: false})

export class StatusPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    if (args === undefined ) {
      console.log(value);
      return value.filter(e => {
        return e;
      });
    } else {
      return value.filter((e) => {
        return e.status === args;
      });
    }
  }
}
