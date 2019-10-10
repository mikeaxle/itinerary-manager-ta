import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'searchPipe', pure: true})

export class SearchPipe implements PipeTransform {
  transform(value: any, key: string, term: string): any {

    return value.filter((item) => {
      if (item.hasOwnProperty(key)) {
        if (term) {
          const regExp = new RegExp('\\b' + term, 'gi');
          return regExp.test(item[key]);
        } else {
          return true;
        }
      } else {
        return false;
      }
    });
  }
}
