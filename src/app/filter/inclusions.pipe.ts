import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'inclusionsFilter', pure: false})

export class InclusionsPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    try {
      return value.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj.key).indexOf(obj.key) === pos;
      });
    } catch (error) {
    }
  }
}
