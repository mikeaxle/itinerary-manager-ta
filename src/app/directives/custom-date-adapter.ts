import { NativeDateAdapter, MatDateFormats } from '@angular/material';

export class MyDateAdapter extends NativeDateAdapter {

  format(date, displayFormat): string {
    if (displayFormat === 'input') {

 /*     const editor-components = date.getDate();
      const month = date.getMonth() + 1
      const year = date.getFullYear()
*/
      /*return `${editor-components}-${month}-${year}`*/
      return date.toDateString();

    } else {

      return date.toDateString();
    }
  }
}

export const MY_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: {month: 'short', year: 'numeric', day: 'numeric'}
  },
  display: {
    dateInput: 'input',
    monthYearLabel: {year: 'numeric', month: 'short'},
    dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
    monthYearA11yLabel: {year: 'numeric', month: 'long'},
  }
};
