import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'commentsFilter', pure: false})

export class CommentsPipe implements PipeTransform {

  transform(value: any, args: string): any {

    // filter comment-editor by editor-components
    return value.filter((e) => {
      try {
        return e.day.id === args;

      } catch (error) {
        console.log(error)
      }

    });
  }
}
