import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'commentsFilter', pure: false})

export class CommentsPipe implements PipeTransform {

  transform(value: any, args: string): any {

    // filter comment by editor-components
    return value.filter((e) => {
      return e.day === args;
    });
  }
}
