import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {DataService} from '../data.service';
import { CountryService } from '../country.service';
import {Router, ActivatedRoute} from '@angular/router';
import {Validators, FormGroup, FormArray, FormBuilder} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {DragulaService} from 'ng2-dragula/ng2-dragula';
import {SavePdfService} from '../save-pdf.service';
import {DayComponent} from '../day/day.component';
import {CommentComponent} from '../comment/comment.component';
import {PaymentComponent} from '../payment/payment.component';
import {ImageSelectorComponent} from '../image-selector/image-selector.component';
import {ItineraryDetailsEditorComponent} from '../itinerary-details-editor/itinerary-details-editor.component';
import { AddCountryNumberComponent} from '../add-country-number/add-country-number.component';
import {ConfirmComponent} from '../confirm/confirm.component';


@Component({
  selector: 'app-itinerary-editor',
  templateUrl: './itinerary-editor.component.html',
  styleUrls: ['./itinerary-editor.component.css']
})
export class ItineraryEditorComponent implements OnInit {
  // navigation params object
  private navigationParams: any;
  itinerary: any = null;
  user: any;
  id: string;
  error: any;
  totalDays: any;
  remainingDays: any;
  usedDays: any;
  inventory: any;
  days: any;
  // tslint:disable-next-line:variable-name
  _days: any[] = [];
  inclusions: any;
  exclusions = 'International travel, Tourist visas, Drinks and meals unless specified in inclusions, General Travel Insurance (it is strongly recommended not to travel without comprehensive travel and medical insurance), Tipping and gratuities (please read the Important Information for your Safari document for more info).';

  adults = 0;
  children = 0;
  total = 0;
  deposit = 0;
  discount = 0;
  totalPayments = 0;
  comments: any;
  payments: any;
  startdate: any;
  enddate: any;
  status = '';


  dayTitles = new Map([]);
  lastUsedParams = {
    country: 0,
    region: 0
  };
  tileColor = '#d8d8d8';
  coverImageTile = null;
  gridImageTiles = [
    { imageUrl: false },
    { imageUrl: false },
    { imageUrl: false },
    { imageUrl: false },
    { imageUrl: false },
    { imageUrl: false },
  ];
  countries: any;
  statuses = [
    'Draft',
    'Sent',
    'Provisional',
    'Confirmed',
    'Complete',
    'Cancelled'
  ];

  // tslint:disable-next-line:variable-name
  date_months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC'
  ];

// inject router, activated route and data worker into component
  currentCompany: any;
  color: any;
  lesserButtonStyle: any;
  constructor(private router: Router, private route: ActivatedRoute,
              public data: DataService, private formbuilder: FormBuilder,
              public dialog: MatDialog, private dragula: DragulaService,
              private savepdf: SavePdfService, private snackBar: MatSnackBar,
              private http: HttpClient, private countryservice: CountryService) {

    // console.log(this.route.params);

    // subscribe dragula drop event
    // this.dragula.drop(event).subscribe(() => {
    //   // iterate local days array
    //   this._days.forEach((day, index) => {
    //     // update editor-components in firebase
    //     this.days.update(day.$key, {position: index});
    //   });
    // });
  }

  ngOnInit() {
    this.currentCompany = localStorage.getItem('currentCompany');
    this.color = localStorage.getItem('color');


    // get navigation parameters
    this.navigationParams = this.route
      .queryParams
      .subscribe(data => {
        // assign id to local variable
        this.id = data.itineraryId;

      });

    // get itinerary
    // todo: remove dummy data
    this.itinerary = this.data.getSingleItem('-L6MmQF4jj7AbmUUVdua', `itineraries/${this.currentCompany}`);

    // map dependent variables to itinerary
    // this.itinerary.map((res) => {
    //   // assign start date and end date as milliseconds
    //   this.startdate = Date.parse(res.startdate);
    //   this.enddate = Date.parse(res.enddate);
    //
    //   /* calculate total days by converting dates into milliseconds, subtracting and
    //   divide by 86400000 which is the number of milliseconds equal to a editor-components */
    //   this.totalDays = 0;
    //   this.totalDays = (this.enddate - this.startdate) / 86400000;
    //   this.totalDays = Math.round(this.totalDays);
    //   this.totalDays++;
    //
    //   // assign status
    //   this.status = res.status;
    //
    //   // check if total is defined
    //   if (res.total !== undefined) {
    //     // assign to local variable
    //     this.total = res.total;
    //   }
    //
    //   // check if deposit is defined
    //   if (res.deposit !== undefined) {
    //     // assign to local variable
    //     this.deposit = res.deposit;
    //   }
    //
    //   // check if discount is defined
    //   if (res.discount !== undefined) {
    //     // assign to local variable
    //     this.discount = res.discount;
    //   }
    //
    //   // assign exclusions if defined
    //   if (res.exclusions !== undefined) {
    //     // assign to local variable
    //     this.exclusions = res.exclusions;
    //   }
    //
    //   // assign children to local variable
    //   this.children = res.children;
    //
    //   // assign adults to local variable
    //   this.adults = res.adults;
    //
    //   // assign cover image
    //   if (res.coverImageTile !== undefined) {
    //     this.coverImageTile = res.coverImageTile;
    //   }
    //
    //   // assign images
    //   if (res.gridImageTiles !== undefined) {
    //     this.gridImageTiles = res.gridImageTiles;
    //     // console.log(this.gridImageTiles)
    //   }
    // }).subscribe();

    // get days related to itinerary id
    // @ts-ignore
    this.days = this.data.af.list('days/' + this.id, {query: {orderByChild: 'position'}});

    this.days.map((res) => {
      // empty _days array
      this._days = [];

      // assign _days array
      this._days = res;

      // iterate days to find out how many days are used
      this.usedDays = 0;
      res.forEach((day) => {
        this.usedDays += Math.round(parseInt(day.days, 10));
      });


      // iterate days and store all inclusions from all accommodations in array
      // tslint:disable-next-line:variable-name
      const _inclusions = [];
      res.forEach((d) => {
        // check if accommodation is present for day
        if (d.accommodation !== undefined) {
          // iterate accommodation
          d.accommodation.forEach(a => {
            // copy day key into inclusions array
            a.day = d.$key;
            _inclusions.push(a);
          });
        }
      });
      // console.log(_inclusions)

      // filter array to include only unique values
      this.inclusions = _inclusions.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj.name).indexOf(obj.name) === pos;
      });
    }).subscribe();

    // get comments related to itinerary id
    this.comments = this.data.getList('comments/' + this.id);

    // get payments related to itinerary id
    this.payments = this.data.getList('payments/' + this.id);

    // calculate total payments
    this.payments.map((res) => {
      // zero payments
      this.totalPayments = 0;

      // if there are payments
      if (res.length !== 0) {
        // iterate payments
        res.forEach((p) => {
          // increment total
          this.totalPayments += parseFloat(p.amount);
        });
      } else {
        this.totalPayments = 0;
      }
    }).subscribe();

    // get contact numbers associated with itinerary
    this.countries = this.data.af.list(`phone_numbers/${this.id}`);
  }



  // function to remove editor-components
  removeDay(key) {
    // remove editor-components from live object
    this.days.remove(key);
  }

  // function to remove comment, first parameter is editor-components index, second parameter is
  removeComment(key: string) {
    // remove comment using data worker
    this.comments.remove(key);
  }

  // function to delete payment
  removePayment(key: string) {
    // remove payment from live object
    this.payments.remove(key);
  }

  // function to delete country
  removeCountry(key) {
    this.countries.remove(key);
  }

  // function to get client name
  getName(key: string, type: string) {
    // client\agent name string
    // tslint:disable-next-line:variable-name
    let string = '';

    // get from firebase
    if (type === 'clients') {
      this.data.getSingleItem(key, `${type}/${this.data.currentCompany}/`)
        .valueChanges()
        .subscribe((res) => {
          // concat first name and last name
          // @ts-ignore
          string = `${res.firstname} ${res.lastname}`;
        });


    } else {
      this.data.getSingleItem(key, `${type}`)
        .valueChanges()
        .subscribe((res) => {
          // concat first name and last name
          // @ts-ignore
          string = `${res.firstname} ${res.lastname}`;
        });

    }

    // return full name
    return string;
  }

  // function to get itinerary descriptions from editor-components
  getItineraryDescriptions(day: any) {
    // string to store all itinerary item descriptions
    let itinerary = '';

    // check if any services were added to editor-components
    if (day.services !== undefined && day.services !== 'undefined') {
      if (day.services.length !== 0) {
        day.services.forEach(d => {
          // concat service
          itinerary += d.service.replace(/^[.\s]+|[.\s]+$/g, '') + '. ';
        });
      }
    }

    // check if any activities were added to editor-components
    if (day.activities !== undefined && day.activities !== 'undefined') {
      if (day.activities.length !== 0) {
        day.activities.forEach(d => {
          // concat activity
          itinerary += d.activity.replace(/^[.\s]+|[.\s]+$/g, '') + '. ';
        });
      }
    }

    // // check if any accommodation wa added to editor-components
    if (day.accommodation !== undefined && day.accommodation !== 'undefined') {
      if (day.accommodation.length !== 0) {

        day.accommodation.forEach(d => {
          // concat accommodation
          // console.log(d.accommodation)
          itinerary += d.description.replace(/^[.\s]+|[.\s]+$/g, '') + '. ';
        });
      }
    }
    return itinerary;
  }

  // function to get icon comment
  getCommentIcon(type: any) {
    let icon = '';

    switch (type) {
      case 'Activity':
        icon = '../assets/icons/comment-activity.svg';
        break;
      case 'Flight':
        icon = '../assets/icons/comment-flight.svg';
        break;
      case 'Info':
        icon = '../assets/icons/comment-info.svg';
        break;
      default:
        break;
    }

    return icon;
  }

  // function to generate editor-components title
  getDayTitle(type: string, day: any) {
    // variables related to editor-components tile
    let title = '';
    // tslint:disable-next-line:variable-name
    let first_day = 0;
    // tslint:disable-next-line:variable-name
    let last_day = 0;

    // variables related to dates
    // tslint:disable-next-line:variable-name
    let start_date: any;
    // tslint:disable-next-line:variable-name
    let end_date: any;
    let dates = '';

    if (day.position < 1) {
      first_day = 1;
    } else {
      // iterate days array
      this._days.every((d, i) => {
        // check if position is current position
        if (d.position === day.position) {
          return false;
        }
        // add all days of days before to current
        first_day += d.days;
        return true;
      });

      // add 1 to editor-components
      first_day += 1;
    }

    // add first editor-components to title
    title += `Day ${first_day}`;

    // init start date to itinerary start date
    start_date = new Date(this.startdate);

    // add number of days before current editor-components to start date to get current start date
    start_date.setDate(start_date.getDate() + (first_day - 1));

    // add start_date to date string
    dates += `${start_date.getDate()} ${this.date_months[start_date.getMonth()]}`;

    // if editor-components contains more than 1 editor-components
    if (day.days > 1) {
      // last editor-components is first editor-components + total days - 1
      last_day = first_day + day.days - 1;

      // add last editor-components to title
      title += ` - ${last_day}`;

      // init end_date to start_date
      end_date = start_date;

      // add number of days
      end_date.setDate(end_date.getDate() + day.days - 1);

      // add to dates string
      dates += ` - ${end_date.getDate()} ${this.date_months[end_date.getMonth()]}`;
    }

    // check type
    if (type === 'title') {
      // add editor-components key and title to map
      this.dayTitles.set(day.$key, title);

      // return editor-components title
      return title;
    } else {
      // return dates
      return dates;
    }
  }

  // function to calculate balance
  getBalance() {
    // remaining balance
    let balance = 0;

    // check if total is equal to 0, assign balance depending on total, discount and total payments
    this.total === 0 ? balance = 0 : balance = (this.total - this.discount) - this.totalPayments;

    // return balance
    return balance;
  }

  // function to open dialog
  openDayDialog(mode: string, day: any) {
    let dialogRef: any;

    // variable to store editor-components position
    let position = 1;

    this.days
      .map((res) => {
        // check if there are any days
        if (res.length !== undefined) {
          // add length of days array to posiiton to come up with position for new editor-components
          position += res.length;
        }
      })
      .subscribe();

    if (mode === 'add') {

      dialogRef = this.dialog.open(DayComponent, {
        width: '600px',
        height: '700px',
        data: {
          mode,
          itineraryId: this.id,
          remainingDays: this.totalDays - this.usedDays,            // pass remaining days
          lastUsedParams: this.lastUsedParams,          // pass object with days array and previously used country + region
          position
        }
      });

    } else if (mode === 'edit') {

      dialogRef = this.dialog.open(DayComponent, {
        width: '600px',
        height: '600px',
        data: {
          mode,
          itineraryId: this.id,
          remainingDays: this.remainingDays,            // pass remaining days
          lastUsedParams: this.lastUsedParams,          // pass object with days array and previously used country + region
          day                                      // editor-components object
        }
      });
    }


    // after dialog is close
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && result !== 'undefined') {
        // reassign previously used country and editor-components
        this.lastUsedParams = result.lastUsedParams;

        // mode is add
        if (mode === 'add') {
          // add position to editor-components
          result.dayForm.position = position;

          // push new editor-components to firebase
          this.data.saveItem('days/' + this.id, result.dayForm)
            .catch((error) => {
              console.log(error);
            });

        } else if (mode === 'edit') {
          // update editor-components
          // console.log(result.dayForm)
          this.data.updateItem(day.$key, 'days/' + this.id, result.dayForm)
            .catch((error) => {
              console.log(error);
            });
        }
      }
    });
  }

  // function to open comment dialog
  openCommentDialog(mode: string, comment: any) {
    let dialogRef: any;
    // check if add or edit mode
    if (mode === 'add') {
      dialogRef = this.dialog.open(CommentComponent, {
        width: '480px',
        data: {mode: 'add', itineraryId: this.id, days: this.dayTitles}
      });
    } else if (mode === 'edit') {
      dialogRef = this.dialog.open(CommentComponent, {
        width: '480px',
        data: {mode: 'edit', itineraryId: this.id, days: this.dayTitles, comment}
      });
    }
  }

  // function to open payment dialog
  openPaymentDialog(mode: string, payment: any) {
    let dialogRef: any;
    // check mode
    if (mode === 'add') {
      dialogRef = this.dialog.open(PaymentComponent, {
        width: '480px',
        data: {mode, id: this.id}
      });
    } else if (mode === 'edit') {
      dialogRef = this.dialog.open(PaymentComponent, {
        width: '480px',
        data: {mode, id: this.id, payment}
      });
    }
  }

  // open country number adding dialog
  openCountryDialog(mode: string, country) {
    let dialogRef: any;

    if (mode === 'add') {
      dialogRef = this.dialog.open(AddCountryNumberComponent, {
        width: '580px',
        data: {mode, id: this.id}
      });
    } else {
      dialogRef = this.dialog.open(AddCountryNumberComponent, {
        width: '580px',
        data: {mode, id: this.id, country}
      });
    }
  }

  // function to open image selector dialog
  openImageSelector(gridImage: any, imageName: string) {
    const dialogRef = this.dialog.open(ImageSelectorComponent, {
      width: '1000px',
      height: '600px'
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (result !== undefined) {
        const objectToWrite = {
        };

        // check name of image
        if (imageName === 'coverImageTile') {
          // assign image url to selected grid image
          gridImage = result;
          // prepare object to write to firebase
          objectToWrite[imageName] = gridImage;
        } else {

          // save item
          gridImage = result;

          // push to local array
          this.gridImageTiles[imageName] = gridImage;
          // console.log(this.gridImageTiles)

          // prepare object to write to firebase
          // @ts-ignore
          objectToWrite.gridImageTiles = this.gridImageTiles;

          // console.log(objectToWrite)
        }

        // write to firebase
        this.itinerary.update(objectToWrite);

      }
    });
  }

  // function to edit itinerary booking details
  openEditItinerary() {
    const dialogRef = this.dialog.open(ItineraryDetailsEditorComponent, {
      width: '480px',
      data: {
        itinerary: this.itinerary,
        usedDays: this.usedDays
      }
    });
  }

  // function to open confirm delete dialog
  openDelete() {

    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '480px',
      data: this.itinerary.title
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        // if result is true
        if (result) {
          this.deleteItinerary();
        }
      }
    });
  }

  // function to delete image
  // TODO: write function to delete image from grid
  deleteImage() {
    console.log('delete image');
  }

  // function to save inclusion edits to firebase on blur or press enter
  onKeyUpInclusions(event: any, data: any) {

    // variable to store data to enter
    const dataToUpdate = {};
    dataToUpdate['accommodation/' + 0 + '/inclusions'] = event.target.value;

    // update inclusion
    this.days.update(data.day, dataToUpdate);


    // console.log(data)
  }

  // function to save quote details to firebase on blur or press enter
  onKeyUpQuote(type: string) {

    // check which control called the function
    switch (type) {
      case 'total':
        this.itinerary.update({total: this.total});
        break;
      case 'deposit':
        this.itinerary.update({deposit: this.deposit});
        break;
      case 'discount':
        this.itinerary.update({discount: this.discount});
        break;
      case 'exclusions':
        this.itinerary.update({exclusions: this.exclusions});
        break;
      default:
        break;
    }
  }

  // function to write status to firebase when status is selected
  onSelect(status) {
    this.itinerary.update({status});
  }

  // function to delete itinerary
  deleteItinerary() {
    this.router.navigate(['../itineraries'])
      .then(() => {

        // show snack bar
        this.snackBar.open(`Itinerary ${this.id} Deleted`, 'CLOSE', {
          duration: 3000
        });

        this.days.remove();
        // this.comments.remove()
        this.payments.remove();
        this.itinerary.remove();

      });
  }

  // function to duplicate itinerary
  duplicateItinerary() {
    // variable to store duplicate
    let duplicate = null;
    let duplicateInvoiceNumber = null;
    let duplicateKey = null;

    // variable to store comments
    let comments = null;


    this.itinerary.map((res) => {
      // map data to duplicate
      duplicate = res;

      // add the word duplicate to title of duplicate
      duplicate.title += '(duplicate)';
    }).subscribe();

    // map comments to local variable
    this.comments.map((res) => comments = res).subscribe();


    // assign invoice number
    this.data.af.object(`companies/${this.currentCompany}`)
      .valueChanges()
      .subscribe((res) => {
      // @ts-ignore
        duplicateInvoiceNumber = res.invoice_number + 1;
      // @ts-ignore
        duplicate.invoice_number = `${res.prefix}-${duplicateInvoiceNumber}`;
    });

    // write duplicate itinerary to
    this.data.af.list(`itineraries/${this.currentCompany}`).push(duplicate)
      .then((res) => {
        // assign duplicate key
        duplicateKey = res.key;

        // check for payments
        this.payments.map((payments) => {
          if (payments.length > 0) {
            // write to firebase
            payments.forEach(p => {
              this.data.af.list(`payments/${duplicateKey}`).push(p);
            });
          }
        }).subscribe();

        // check for days
        this.days.map((days) => {
          if (days.length > 0) {
            // write to firebase
            days.forEach(d => {
              this.data.af.list(`days/${duplicateKey}`).push(d)
                .then((dayDuplicate) => {
                  /// check for comments
                  if (comments.length > 0) {
                    comments.forEach((c) => {
                      if (c.day === d.$key) {
                        c.day = dayDuplicate.key;
                        // write to firebase
                        this.data.af.list(`comments/${duplicateKey}`).push(c);
                      }
                    });
                  }
                });
            });
          }
        }).subscribe();

      })
      .then(() => {

        this.router.navigate(['itineraries'], {queryParams: {itineraryId: duplicateKey}})
          .then(() => {
            // update invoice number
            this.data.updateItem(this.currentCompany, 'companies', {invoice_number: duplicateInvoiceNumber});

            this.snackBar.open(`Itinerary ${duplicateKey}: ${duplicate.title.slice(0, duplicate.title.length - 11)} Duplicated`, 'CLOSE', {
              duration: 3000
            });
          });
      });
  }

  // function to save as PDF
  saveAsPdf(type: string) {
    // flag to determine if printing is possible
    let canPrint = false;

    // check if cover image is specified
    if (this.coverImageTile !== undefined ) {
      // check if grid images are all specified

      for (const g of this.gridImageTiles) {
        if (g.imageUrl !== false) {
          canPrint = true;
        } else {
          canPrint = false;
          break;
        }
      }
    }

    if (canPrint) {
      if (type === 'costs') {
        this.savepdf.savePDF(this.id, 'full', this.usedDays);
      } else if (type  === 'no costs') {

        this.savepdf.savePDF(this.id, 'full no cost', this.usedDays);
      }
    } else {
      alert('Please add all 7 images in order to print the full pdf ');
      // console.log(`Can print: ${canPrint}, ${this.gridImageTiles} `)
    }
  }

  // save partial pdf
  saveAsPdfPartial() {

    this.savepdf.savePDF(this.id, 'partial', this.usedDays);
  }

}
