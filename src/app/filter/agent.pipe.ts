import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'agentFilter', pure: false})
export class AgentPipe implements PipeTransform {
  transform(value: any, args?: any): any {

    return value.filter((e) => {
      return e.agent === args;
    });
  }
}
