import {Component, NgModule, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DataService} from '../../services/data.service';
import {CountryService} from '../../services/country.service';
import {Router, ActivatedRoute, Params, ParamMap} from '@angular/router';
import {Validators, FormGroup, FormArray, FormBuilder} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {DragulaService} from 'ng2-dragula/ng2-dragula';
import {SavePdfService} from '../../services/save-pdf.service';
import {DayComponent} from './day/day.component';
import {CommentComponent} from './comment/comment.component';
import {PaymentComponent} from './payment/payment.component';
import {ImageSelectorComponent} from './image-selector/image-selector.component';
import {AddCountryNumberComponent} from './add-country-number/add-country-number.component';
import {ConfirmComponent} from '../../shared/confirm/confirm.component';
import {MONTHS} from '../../model/months';
import {EXCLUSIONS} from '../../model/exclusions';
import {GridImageTiles} from '../../model/gridImageTiles';
import {Country} from '../../model/country';
import {ItinerariesComponent} from '../itineraries.component';
import {CommonModule} from '@angular/common';
import {AppRoutingModule} from '../../app-routing.module';
import {map, switchMap} from 'rxjs/operators';
// @ts-ignore
import {STATUS} from '../../model/statuses';
import {ItineraryDetailsEditorComponent} from './itinerary-details-editor/itinerary-details-editor.component';

@NgModule({
  imports: [CommonModule]
})

@Component({
  selector: 'app-itinerary-editor',
  styleUrls: ['./itinerary-editor.component.css'],
  templateUrl: './itinerary-editor.component.html'
})
export class ItineraryEditorComponent implements OnInit, OnDestroy {
  private navigationParams: any;
  user: any;
  id: string;
  error: any;
  totalDays: any = 0;
  remainingDays: any;
  usedDays: any;
  inventory: any;
  days: any;
  _DAYS = [];
  inclusions = [];
  total = 0;
  totalPayments = 0;
  comments;
  payments ;
  statuses = STATUS;
  dayTitles = new Map([]);
  lastUsedParams = {
    country: 0,
    region: 0
  };
  tileColor = '#d8d8d8';
  coverImageTile = null;
  gridImageTiles = new GridImageTiles();
  countries;
  currentCompany: any;
  color: any;
  lesserButtonStyle: any;
  itinerary$: any;
  date_months = MONTHS;
  exclusions = EXCLUSIONS;
  discount = 0;
  deposit = 0

  constructor(public router: Router, private route: ActivatedRoute, public data: DataService, public formbuilder: FormBuilder,
              public dialog: MatDialog, private dragula: DragulaService, public savePdfService: SavePdfService, public snackBar: MatSnackBar,
              public http: HttpClient, public countryService: CountryService) {

  }

  ngOnInit(): void {
    // get itinerary
    this.itinerary$ = JSON.parse(this.route.snapshot.paramMap.get('itinerary'));

    // todo: convert start date and end date on front end
    /* calculate total days by converting dates into milliseconds, subtracting and
divide by 86400000 which is the number of milliseconds equal to a editor-components */
    this.totalDays = Math.round((Date.parse(this.itinerary$.enddate) - Date.parse(this.itinerary$.startdate)) / 86400000);
    this.totalDays++;

    // todo: status assigned on front end from itinerary
    // todo: show in front end from itinerary$ check if total is defined, check if deposit is defined, check if discount is defined
    // assign exclusions if not defined
    if (this.itinerary$.exclusions === null) {
      this.itinerary$.exclusions = EXCLUSIONS;
    }

    // todo: move to front end from itinerary$ assign children to local variable, assign adults to local variable, assign cover image, assign images

    // get itinerary
    // this.itinerary = this.data.getSingleItem(this.id, `itineraries/${this.data.currentCompany}`)
    //   .snapshotChanges()

    // get days related to itinerary id
    this.days = this.data.af.list('days/' + this.itinerary$.key, ref => ref.orderByChild('position'))
      .snapshotChanges()
      .subscribe(res => {
        // reset temp inclusions array, used days and temp days array
        const _INCLUSIONS = [];
        this.usedDays = 0;
        this._DAYS = [];

        // assign _DAYS array
        res.forEach((data) => {
          // get day
          const day = data.payload.val();

          // add key
          day[`key`] = data.key;

          // add days to find out how many days are used
          this.usedDays += Math.round(parseInt(day[`days`], 10));

          // iterate days and store all inclusions from all accommodations in array
          // check if accommodation is present for day
          if (day[`accommodation`] !== undefined) {
            // iterate accommodation
            day[`accommodation`].forEach(accommodation => {
              // copy day key into inclusions array
              accommodation.day = day[`key`];
              _INCLUSIONS.push(accommodation);
            });
          }

          // add day to _DAYS array
          this._DAYS.push(day);
        });

        // filter array to include only unique values
        this.inclusions = _INCLUSIONS.filter((obj, pos, arr) => {
          return arr.map(mapObj => mapObj.name).indexOf(obj.name) === pos;
        });
      });

    // get comments related to itinerary id
    this.comments = this.data.af.list('comments/' + this.itinerary$.key)
      .snapshotChanges();

    // get payments related to itinerary id
    this.payments = this.data.af.list('payments/' + this.itinerary$.key)
      .snapshotChanges()
      .pipe(map(items => {
        return items.map(payment => {
          this.totalPayments += parseFloat(payment.payload.toJSON[`amount`]);
        });
      }));


    // get contact numbers associated with itinerary
    this.countries =  this.data.af.list(`phone_numbers/${this.itinerary$.key}`)
      .snapshotChanges();
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
        .snapshotChanges()
        .subscribe((res) => {
          // concat first name and last name
          string = `${res[`firstname`]} ${res[`lastname`]}`;
        })
        .unsubscribe();
    } else {
      this.data.getSingleItem(key, `${type}`)
        .snapshotChanges()
        .subscribe((res) => {
          // concat first name and last name
          string = `${res[`firstname`]} ${res[`lastname`]}`;
        })
        .unsubscribe();
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
    let firstDay = 0;
    let lastDay = 0;

    // variables related to dates
    // tslint:disable-next-line:variable-name
    let start_date: any;
    // tslint:disable-next-line:variable-name
    let end_date: any;
    let dates = '';

    if (day.position < 1) {
      firstDay = 1;
    } else {
      // iterate days array
      this._DAYS.every((d, i) => {
        // check if position is current position
        if (d.position === day.position) {
          return false;
        }
        // add all days of days before to current
        firstDay += d.days;
        return true;
      });

      // add 1 to editor-components
      firstDay += 1;
    }

    // add first editor-components to title
    title += `Day ${firstDay}`;

    // init start date to itinerary start date
    start_date = new Date(this.itinerary$.startdate);

    // add number of days before current editor-components to start date to get current start date
    start_date.setDate(start_date.getDate() + (firstDay - 1));

    // add start_date to date string
    dates += `${start_date.getDate()} ${this.date_months[start_date.getMonth()]}`;

    // if editor-components contains more than 1 editor-components
    if (day.days > 1) {
      // last editor-components is first editor-components + total days - 1
      lastDay = firstDay + day.days - 1;

      // add last editor-components to title
      title += ` - ${lastDay}`;

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
    this.total === 0 ? balance = 0 : balance = (this.total - this.itinerary$.discount) - this.totalPayments;

    // return balance
    return balance;
  }

  // function to open dialog
  openDayDialog(mode: string, day: any) {
    let dialogRef: any;

    // variable to store editor-components position
    let position = 1;

    this.days.map((res) => {
        // check if there are any days
        if (res.length !== undefined) {
          // add length of days array to posiiton to come up with position for new editor-components
          position += res.length;
        }
      });

    if (mode === 'add') {

      dialogRef = this.dialog.open(DayComponent, {
        data: {
          itineraryId: this.itinerary$.key,
          lastUsedParams: this.lastUsedParams,          // pass object with days array and previously used country + region
          mode,
          position,
          remainingDays: this.totalDays - this.usedDays,            // pass remaining days
        },
        height: '700px',
        width: '600px'
      });

    } else if (mode === 'edit') {

      dialogRef = this.dialog.open(DayComponent, {
        data: {
          day,                                      // editor-components object
          itineraryId: this.id,
          lastUsedParams: this.lastUsedParams,          // pass object with days array and previously used country + region
          mode,
          remainingDays: this.remainingDays,            // pass remaining days
        },
        height: '600px',
        width: '600px'
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
    }).unsubscribe();
  }

  // function to open comment dialog
  openCommentDialog(mode: string, comment: any) {
    let dialogRef: any;
    // check if add or edit mode
    if (mode === 'add') {
      dialogRef = this.dialog.open(CommentComponent, {
        data: {mode: 'add', itineraryId: this.id, days: this.dayTitles},
        width: '480px'
      });
    } else if (mode === 'edit') {
      dialogRef = this.dialog.open(CommentComponent, {
        data: {mode: 'edit', itineraryId: this.id, days: this.dayTitles, comment},
        width: '480px'
      });
    }
  }

  // function to open payment dialog
  openPaymentDialog(mode: string, payment: any) {
    let dialogRef: any;
    // check mode
    if (mode === 'add') {
      dialogRef = this.dialog.open(PaymentComponent, {
        data: {mode, id: this.id},
        width: '480px'
      });
    } else if (mode === 'edit') {
      dialogRef = this.dialog.open(PaymentComponent, {
        data: {mode, id: this.id, payment},
        width: '480px'
      });
    }
  }

  // open country number adding dialog
  openCountryDialog(mode: string, country) {
    let dialogRef: any;

    if (mode === 'add') {
      dialogRef = this.dialog.open(AddCountryNumberComponent, {
        data: { id: this.itinerary$.key, mode },
        width: '580px',

      });
    } else {
      dialogRef = this.dialog.open(AddCountryNumberComponent, {
        data: {country, id: this.id, mode},
        width: '580px',
      });
    }
  }

  // function to open image selector dialog
  openImageSelector(gridImage: any, imageName: string) {
    const dialogRef = this.dialog.open(ImageSelectorComponent, {
      height: '600px',
      width: '1000px'
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (result !== undefined) {
        const objectToWrite = {};

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
          objectToWrite[`gridImageTiles`] = this.gridImageTiles;

          // console.log(objectToWrite)
        }

        // write to firebase
        this.itinerary$.update(objectToWrite);

      }
    }).unsubscribe();
  }

  // function to edit itinerary booking details
  openEditItinerary() {
    const dialogRef = this.dialog.open(ItineraryDetailsEditorComponent, {
      data: {
        itinerary: this.itinerary$,
        usedDays: this.usedDays
      },
      width: '480px',
    });
  }

  // function to open confirm delete dialog
  openDelete() {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: this.itinerary$.title,
      width: '480px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        // if result is true
        if (result) {
          this.deleteItinerary();
        }
      }
    }).unsubscribe();
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
        this.itinerary$.update({total: this.total});
        break;
      case 'deposit':
        this.itinerary$.update({deposit: this.itinerary$.deposit});
        break;
      case 'discount':
        this.itinerary$.update({discount: this.itinerary$.discount});
        break;
      case 'exclusions':
        this.itinerary$.update({exclusions: this.exclusions});
        break;
      default:
        break;
    }
  }

  // function to write status to firebase when status is selected
  onSelect(status) {
    this.itinerary$.update({status});
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
        this.itinerary$.remove();

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


    this.itinerary$.map((res) => {
      // map data to duplicate
      duplicate = res;

      // add the word duplicate to title of duplicate
      duplicate.title += '(duplicate)';
    });

    // map comments to local variable
    this.comments.map((res) => comments = res)
      .subscribe();


    // assign invoice number
    this.data.af.object(`companies/${this.currentCompany}`)
      .valueChanges()
      .subscribe((res) => {
      duplicateInvoiceNumber = res[`invoice_number`] + 1;
      duplicate.invoice_number = `${res[`prefix`]}-${duplicateInvoiceNumber}`;
    }).unsubscribe();

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
        });

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

      for (const g of this.gridImageTiles.gridImageTiles) {
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
        this.savePdfService.savePDF(this.id, 'full', this.usedDays);
      } else if (type  === 'no costs') {
        this.savePdfService.savePDF(this.id, 'full no cost', this.usedDays);
      }
    } else {
      alert('Please add all 7 images in order to print the full pdf ');
      // console.log(`Can print: ${canPrint}, ${this.gridImageTiles} `)
    }
  }

  // save partial pdf
  saveAsPdfPartial() {
    this.savePdfService.savePDF(this.id, 'partial', this.usedDays);
  }

  ngOnDestroy() {
    // unsubscribe from observables to remove memory leaks
    // this.days.unsubsribe();
    this.comments.unsubscribe();
  }
}
