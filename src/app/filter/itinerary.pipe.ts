import { Pipe, PipeTransform } from '@angular/core';


@Pipe({name: 'ItineraryItemFilterPipe', pure: false})

export class ItineraryItemFilterPipePipe implements PipeTransform {

  transform(value: any, args: string, args2: string, args3): any {
    try {
      if (args === 'Service') {
        return value.filter((e) => {
          return e.type === 'Service' && e.destination === args2 && e.region === args3;
        });
      } else if (args === 'Accommodation') {
        return value.filter((e) => {
          return e.type === 'Accommodation' && e.destination === args2 && e.region === args3;
        });
      } else if (args === 'Activity') {
        return value.filter((e) => {
          return e.type === 'Activity' && e.destination === args2 && e.region === args3;
        });
      }
    } catch (error) {

    }
  }
}
