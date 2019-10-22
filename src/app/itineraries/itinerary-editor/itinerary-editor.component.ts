import {Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DataService} from '../../services/data.service';
import {CountryService} from '../../services/country.service';
import {Router, ActivatedRoute} from '@angular/router';
import {FormBuilder} from '@angular/forms';
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
import {CommonModule} from '@angular/common';
import {STATUS} from '../../model/statuses';
import {ItineraryDetailsEditorComponent} from './itinerary-details-editor/itinerary-details-editor.component';
import Swal from 'sweetalert2';
import {GridImageTiles} from '../../model/gridImageTiles';

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
  error: any;
  totalDays: any = 0;
  remainingDays: any;
  usedDays: any;
  inventory: any;
  daysRef$: any;
  days = [];
  inclusions = [];
  totalPayments = 0;
  paymentsRef$ ;
  statuses = STATUS;
  dayTitles = new Map([]);
  lastUsedParams = {
    country: 0,
    region: 0
  };
  tileColor = '#d8d8d8';
  coverImageTile = null;
  countriesRef$;
  color: any;
  lesserButtonStyle: any;
  itinerary$: any;
  DATE_MONTHS = MONTHS;
  exclusions = EXCLUSIONS;
  discount = 0;
  deposit = 0;
  comments;
  payments;
  countries;
  itineraryId;
  private itineraryRef$;
  commentsRef$;
  private agentRef$;
  private clientRef$;
  private client: any;
  private agent: any;
  private paymentsSubscription$;
  private averageCost;
  paymentsPdf = [];
  commentsPdf = [];
  private commentsSubscription$: any;
  private countriesSubscription$;
  countriesPdf = [];
  gridImageTiles =  [
    { imageUrl: false },
{ imageUrl: false },
{ imageUrl: false },
{ imageUrl: false },
{ imageUrl: false },
{ imageUrl: false },
];

  constructor(public router: Router, private route: ActivatedRoute, public data: DataService, public formbuilder: FormBuilder,
              public dialog: MatDialog, private dragula: DragulaService, public savePdfService: SavePdfService, public snackBar: MatSnackBar,
              public http: HttpClient, public countryService: CountryService) {

  }

  ngOnInit(): void {
    // get itinerary
    this.itineraryId = this.route.snapshot.paramMap.get('id');

    // get itinerary firebase reference
    this.itineraryRef$ = this.data.af.object(`itineraries/${this.data.company}/${this.itineraryId}`).snapshotChanges();

    // subscribe to itinerary ref
    this.itineraryRef$
      .subscribe(_ => {
        if (_.payload.val()) {
          // get itinerary payload
          const it = _.payload.val();

          // get itinerary key
          it[`key`] = _.payload.key;

          // assign to local itinerary object for manipulation
          this.itinerary$ = it;

          // assign exclusions if not defined
          this.itinerary$[`exclusions`]  = this.itinerary$[`exclusions`] ? this.itinerary$[`exclusions`] : this.exclusions;


          // set grid image tiles
          if (it.gridImageTiles) {
            this.gridImageTiles = it.gridImageTiles;
          }

          // set finance variables
          this.itinerary$[`total`] = this.itinerary$[`total`] ? this.itinerary$[`total`] : 0;
          this.itinerary$[`discount`] = this.itinerary$[`discount`] ? this.itinerary$[`discount`] : 0;
          this.itinerary$[`deposit`] = this.itinerary$[`deposit`] ? this.itinerary$[`deposit`] : 0;

          // get days related to itinerary id
          this.getDays();

          // calculate total days remaining
          this.calculateDays(it);

          // get payments related to itinerary id
          this.getPayments(it);

          // get client
          this.getClient();

          // get agent
          this.getAgent();



          // get contact numbers associated with itinerary
          this.getContactNumbersForCountries();

          // get comments related to itinerary id
          this.getComments();
        }
      });



  }

  // calculates total days assigned to itinerary
  private calculateDays(itinerary) {
    /* calculate total days by converting dates into milliseconds, subtracting and divide by 86400000 which is the number of milliseconds equal to a editor-components */
    this.totalDays = Math.round((Date.parse(itinerary.enddate) - Date.parse(itinerary.startdate)) / 86400000);
    this.totalDays++;
  }

// get contact numbers to associated countries related to itinerary
  private getContactNumbersForCountries() {
    this.countriesRef$ = this.data.af.list(`phone_numbers/${this.itineraryId}`);
    this.countries = this.countriesRef$.snapshotChanges();

    this.countriesSubscription$ = this.countries.subscribe(_ => {
      _.forEach(snapshot => {
        const country = snapshot.payload.val();
        country.key = snapshot.key;
        this.countriesPdf.push(country);
      });
    });
  }

  // get payments related to itinerary
  private getPayments(itinerary) {
    // init payments firebase list reference
    this.paymentsRef$ = this.data.af.list('payments/' + this.itineraryId);

    // init payments snapshot array
    this.payments = this.paymentsRef$.snapshotChanges();

    // init payments subscription
    this.paymentsSubscription$ = this.payments.subscribe(_ => {
      // reset payments
      this.paymentsPdf = [];
      this.totalPayments = 0;
      this.averageCost = 0;

      _.forEach(snapshot => {
        const payment = snapshot.payload.val();
        payment.key = snapshot.key;
          // increment total payments
        this.totalPayments += parseFloat(payment.amount);

          // add to array for pdf
        this.paymentsPdf.push(payment);
        });

        // calculate average
      this.averageCost = itinerary.total / parseFloat(itinerary.children + itinerary.adults);
      });
  }

  // get comments related to itinerary
  private getComments() {
    this.commentsRef$ = this.data.af.list('comments/' + this.itineraryId);
    this.comments = this.commentsRef$.snapshotChanges();
    this.commentsSubscription$ = this.comments.subscribe(_ => {
      _.forEach(snapshot => {
        const comment = snapshot.payload.val();
        comment.key = snapshot.key;
        this.commentsPdf.push(comment);
      });
    });
  }

  // get days related to itinerary
   private  getDays() {
    this.days = [];
    this.daysRef$ = this.data.af.list('days/' + this.itineraryId, ref => ref.orderByChild('position'))
      .snapshotChanges()
      .subscribe(_ => {
        // reset temp inclusions array, used days and temp days array
        const _INCLUSIONS = [];
        this.usedDays = 0;
        this.days = [];

        // assign days array
        _.forEach((data) => {
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

          this.days.push(day);
        });

        // filter array to include only unique values
        this.inclusions = _INCLUSIONS.filter((obj, pos, arr) => {
          return arr.map(mapObj => mapObj.name).indexOf(obj.name) === pos;
        });
      });
  }

  // function to delete firebase objects
  private deleteObjectFromFirebase(path: string, type: string) {
    this.data.af.object(path)
      .remove()
      .then(_ => {
        console.log(`${type} deleted.`);
      })
      .catch(err => {
        console.log(err);
        Swal.fire(`Delete ${type}`, err.message, 'error');
      });
  }

// function to remove editor-components
  removeDay(key) {
    this.deleteObjectFromFirebase(`days/${this.itineraryId}/${key}`, 'day');
  }

  // function to remove comment
  removeComment(key: string) {
    this.commentsRef$.remove(key);
    console.log('comment deleted');
  }

// function to delete payment
  removePayment(key: string) {
    this.paymentsRef$.remove(key);
    console.log('payment deleted');
  }

  // function to delete country
  removeCountry(key) {
    this.countriesRef$.remove(key);
    console.log('country deleted');
  }


  // gets agent object
  getAgent() {
    this.agentRef$ = this.data.af.object(`users/${this.itinerary$.agent}`)
      .snapshotChanges()
      .subscribe(_ => {
        this.agent = _.payload.val();
        this.agent[`key`] = _.key;
      });
  }

  // gets client
  getClient() {
    this.clientRef$ = this.data.af.object(`clients/${this.data.company}/${this.itinerary$.client}`)
      .snapshotChanges()
      .subscribe(_ => {
        this.client = _.payload.val();
        this.client[`key`] =  _.key;
      });
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
      this.days.every((d, i) => {
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

    // subscribe to itinerary ref
    this.itineraryRef$
      .subscribe(_ => {
        // init start date to itinerary start date
        start_date = new Date(_.payload.val().startdate);

        // add number of days before current editor-components to start date to get current start date
        start_date.setDate(start_date.getDate() + (firstDay - 1));

        // add start_date to date string
        dates += `${start_date.getDate()} ${this.DATE_MONTHS[start_date.getMonth()]}`;

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
          dates += ` - ${end_date.getDate()} ${this.DATE_MONTHS[end_date.getMonth()]}`;
        }
      });

    // check type
    if (type === 'title') {
      // add editor-components key and title to map
      this.dayTitles.set(day.key, title);

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
    this.itinerary$.total === 0 ? balance = 0 : balance = (this.itinerary$.total - this.itinerary$.discount) - this.totalPayments;

    // return balance
    return balance;
  }

  // function to open dialog
  openDayDialog(mode: string, day: any) {
    let dialogRef: any;

    // variable to store editor-components position
    let position = 1;

    this.days.forEach((dy, index) => {
        // check if there are any days
        // if (res.length !== undefined) {
          // add length of days array to position to come up with position for new editor-components
          position += index; // may have to match the pos and index before assigning the two
        // }
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
          itineraryId: this.itineraryId,
          lastUsedParams: this.lastUsedParams,          // pass object with days array and previously used country + region
          mode,
          remainingDays: this.remainingDays,            // pass remaining days
        },
        height: '600px',
        width: '600px'
      });
    }


    // after dialog is close
    dialogRef.afterClosed().subscribe(days => {
      // check for days
      if (days) {
        // reassign previously used country and editor-components
        this.lastUsedParams = days.lastUsedParams;

        // mode is add
        if (mode === 'add') {
          // add position to editor-components
          days.dayForm.position = position;

          // push new editor-components to firebase
          this.data.saveItem('days/' + this.itineraryId, days.dayForm)
            .then(_ => {
              console.log('new days added.');
            })
            .catch(error => {
              console.log(error);
              Swal.fire('Day editor', 'Adding days failed', 'error');
            });

        } else if (mode === 'edit') {
          // update editor-components
          // console.log(result.dayForm)
          this.data.updateItem(day.key, 'days/' + this.itineraryId, days.dayForm)
            .then(_ => {
              console.log('days updated.');
            })
            .catch(error => {
              console.log(error);
              Swal.fire('Day editor', 'Updating days failed', 'error');
            });
        }
      }
    });
  }

  // function to open comment dialog
  openCommentDialog(mode: string, data: any) {
    // declare dialog reference
    let dialogRef: any;

    // check if add or edit mode
    if (mode === 'add') {
      // open comment modal in add mode
      dialogRef = this.dialog.open(CommentComponent, {
        data: {
          comment: null,
          days: this.dayTitles,
          itineraryId: this.itinerary$.key,
          mode: 'add',
        },
        width: '480px'
      });
    } else if (mode === 'edit') {
      // open modal in edit mode
      dialogRef = this.dialog.open(CommentComponent, {
        data: {
          comment: data.payload.val(),
          days: this.dayTitles,
          itineraryId: this.itineraryId,
          mode: 'edit'
        },
        width: '480px'
      });
    }


    // function to run after dialog is close
    dialogRef.afterClosed().subscribe(comment => {
      // check for comment
      if (comment) {
        // save to firebase comments list
        if (mode === 'add') {
          this.data.saveItem('comments/' + this.itineraryId, comment)
            .then(() => {
              console.log('new comment added.');
            })
            .catch((error) => {
              console.log(error);
              Swal.fire('Comment editor', 'adding new comment failed', 'error');
            });

        } else if (mode === 'edit') {
          this.commentsRef$.update(data.key, comment)
            .then(() => {
              console.log('comment updated.');
            })
            .catch((error) => {
              console.log(error);
              Swal.fire('Comment editor', 'Updating comment failed', 'error');
            });
        }
      }
    });
  }

  // function to open payment dialog
  openPaymentDialog(mode: string, data: any) {
    let dialogRef: any;
    // check mode
    if (mode === 'add') {
      dialogRef = this.dialog.open(PaymentComponent, {
        data: {
          mode,
          id: this.itineraryId
        },
        width: '480px'
      });
    } else if (mode === 'edit') {
      dialogRef = this.dialog.open(PaymentComponent, {
        data: {
          id: this.itineraryId,
          mode,
          payment: data.payload.val()
        },
        width: '480px'
      });
    }

    // function to run after dialog is close
    dialogRef.afterClosed()
      .subscribe(payment => {
        if (payment) {
          // convert date to date string
          if (mode === 'edit') {
            // convert date object to string
            payment.date = payment.date.toDateString();

            // write payment to firebase
            this.paymentsRef$.update(data.key, payment)
              .then(() => {
                console.log('comment updated');
              })
              .catch((error) => {
                console.log(error);
                Swal.fire('Payment Editor', 'Updating payment failed', 'error');
              });
          }

          if (mode === 'add') {
            payment.date = payment.date.toDateString();
            // write payment to firebase
            this.paymentsRef$.push(payment)
              .then(() => {
                console.log('payment added');
              })
              .catch((error) => {
                console.log(error);
                Swal.fire('Payment Editor', 'Adding new payment failed', 'error');
              });
          }
        }
      });
  }

  // open country number adding dialog
  openCountryDialog(mode: string, data: any) {
    let dialogRef: any;

    if (mode === 'add') {
      dialogRef = this.dialog.open(AddCountryNumberComponent, {
        data: { id: this.itinerary$.key, mode },
        width: '580px',

      });
    } else {
      dialogRef = this.dialog.open(AddCountryNumberComponent, {
        data: {
          country: data.payload.val(),
          id: data.key,
          mode
        },
        width: '580px',
      });
    }

    // function to run after dialog is closed
    dialogRef.afterClosed()
      .subscribe(country => {
        if (country) {
          if (mode === 'edit') {
            // update existing item
            this.countriesRef$.update(data.key, country)
              .then(_ => {
                console.log('phone number updated');
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            // save new contact number
            this.countriesRef$.push(country)
              .then(() => {
                console.log('country added');
              })
              .catch((error) => {
                console.log(error);

                //  swal
                Swal.fire('Comment Editor', 'Comment update failed', 'error');
              });
          }
        }
      });
  }

  // function to open image selector dialog
  openImageSelector(gridImage, imageName) {
    const dialogRef = this.dialog.open(ImageSelectorComponent, {
      height: '600px',
      width: '1000px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result)
      if (result) {
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
          // }

          // write to firebase
          this.data.af.object(`itineraries/${this.data.company}/${this.itineraryId}`).update(objectToWrite)
            .then(_ => {
              console.log('media item attached');
            })
            .catch(err => {
              console.log(err);
              Swal.fire('Media Selector', 'adding media failed', 'error');
            })
        }
      }
    })
  }

  // function to edit itinerary booking details
  openEditItinerary() {
    const dialogRef = this.dialog.open(ItineraryDetailsEditorComponent, {
      data: {
        agent: this.agent,
        client: this.client,
        itinerary: this.itinerary$,
        usedDays: this.usedDays
      },
      width: '480px',
    });


    // after dialog is closed
    dialogRef.afterClosed().subscribe(result => {
      // update itinerary
      this.updateItinerary();
    });
  }

  // function to open confirm delete dialog
  openDelete() {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: this.itinerary$.title,
      width: '480px'
    });

    dialogRef.afterClosed().subscribe((_) => {
      // if result is true, delete itinerary
        this.deleteItinerary();
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
    this.updateFirebaseObject(`days/${this.itineraryId}/${data.day}/`, dataToUpdate, 'inclusion');
  }

  private updateFirebaseObject(path: any, dataToUpdate, caller: string) {
    this.data.af.object(path)
      .update(dataToUpdate)
      .then(_ => {
        console.log(`updated ${caller}`);
      })
      .catch(err => {
        console.log(err);
        Swal.fire('Inclusions', `Failed to update ${caller}. ${err.message}`, 'error');
      });
  }

// function to save quote details to firebase on blur or press enter
  onKeyUpSave(type: string) {

    // check which control called the function
    switch (type) {
      case 'total':
        this.updateFirebaseObject(`itineraries/${this.data.company}/${this.itineraryId}`,
          { total: this.itinerary$.total },
          'itinerary total');
        break;
      case 'deposit':
        this.updateFirebaseObject(`itineraries/${this.data.company}/${this.itineraryId}`,
          { deposit: this.itinerary$.deposit },
          'itinerary deposit');
        break;
      case 'discount':
        this.updateFirebaseObject(`itineraries/${this.data.company}/${this.itineraryId}`,
          { discount: this.itinerary$.discount },
          'itinerary discount');
        break;
      case 'exclusions':
        this.updateFirebaseObject(`itineraries/${this.data.company}/${this.itineraryId}`,
          { exclusions: this.itinerary$.exclusions },
          'exclusions');
        break;
      default:
        break;
    }
  }

  // function to write status to firebase when status is selected
  onSelect(status) {
    this.itineraryRef$.update({status});
  }

  // function to delete itinerary
  deleteItinerary() {
    // delete itinerary
    this.data.af.object(`itineraries/${this.data.company}/${this.itineraryId}`)
      .remove()
      .then(_ => {
        // Swal
        Swal.fire('Delete Itinerary', `Itinerary ${this.itineraryId} Deleted`, 'success')
          .then( _ => {
            // delete countries
            this.countriesRef$ ? this.data.af.list(`phone_numbers/${this.itineraryId}`).remove() : console.log('no countries to delete');

            // delete days
            this.daysRef$ ? this.data.af.list('days/' + this.itineraryId).remove() : console.log('no days to delete');

            // delete comments
            this.commentsRef$ ? this.data.af.list('comments/' + this.itineraryId).remove() : console.log('no comments to delete');

            // delete payments
            this.paymentsRef$ ? this.data.af.list('payments/' + this.itineraryId).remove() : console.log('no payments to delete');
          });
      })
      .catch(err => {
        // Swal
        Swal.fire('Delete Itinerary', `Itinerary ${this.itineraryId} failed to delete`, 'error');
      });

    // go to itineraries page
    this.router.navigate(['/itineraries']);
  }

  // function to duplicate itinerary
  duplicateItinerary() {
    // variable to store duplicate
    let duplicate = null;
    let duplicateInvoiceNumber = null;
    let duplicateKey = null;

    // variable to store comments
    let comments = null;

      // copy data to duplicate
    duplicate = this.itinerary$;

      // add the word duplicate to title of duplicate
    duplicate.title += '(duplicate)';
    duplicate.title += '(duplicate)';

    // map comments to local variable
    comments = this.comments;

    // assign invoice number
    this.data.af.object(`companies/${this.data.company}`)
      .valueChanges()
      .subscribe((res) => {
      duplicateInvoiceNumber = res[`invoice_number`] + 1;
      duplicate.invoice_number = `${res[`prefix`]}-${duplicateInvoiceNumber}`;
    }).unsubscribe();

    // write duplicate itinerary to
    this.data.af.list(`itineraries/${this.data.company}`).push(duplicate)
      .then((res) => {
        // assign duplicate key
        duplicateKey = res.key;

        // check for payments
        this.paymentsRef$.map((payments) => {
          if (payments.length > 0) {
            // write to firebase
            payments.forEach(p => {
              this.data.af.list(`payments/${duplicateKey}`).push(p);
            });
          }
        });

        // check for days
        this.daysRef$.map((days) => {
          if (days.length > 0) {
            // write to firebase
            days.forEach(d => {
              this.data.af.list(`days/${duplicateKey}`).push(d)
                .then((dayDuplicate) => {
                  /// check for comments
                  if (comments.length > 0) {
                    comments.forEach((c) => {
                      if (c.day === d.key) {
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
        // go to duplicate itinerary
        this.router.navigate(['/itinerary-editor', duplicateKey])
          .then(() => {
            // update invoice number
            this.data.updateItem(this.data.company, 'companies', {invoice_number: duplicateInvoiceNumber})
              .then(_ => {
                // Swal
                Swal.fire('Duplicate Itinerary',
                  `Itinerary ${duplicateKey}: ${duplicate.title.slice(0, duplicate.title.length - 11)} Duplicated`,
                  'success');
              })
              .catch(err => {
                // Swal
                Swal.fire('Duplicate Itinerary', err.message, 'success');
              });
          });
      });
  }

  // function to save as PDF
  saveAsPdf(type: number) {
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
      if (type === 1) {
        this.savePdfService.savePDF({
          comments: this.comments,
          days: this.days,
          itinerary: this.itinerary$,
          payments: this.payments,
          phoneNumbers: this.countries,
        }, 1, this.usedDays);
      } else if (type  === 2) {
        this.savePdfService.savePDF(
          {
            comments: this.comments,
            days: this.days,
            itinerary: this.itinerary$,
            payments: this.payments,
            phoneNumbers: this.countries,
          }, 2, this.usedDays);
      }
    } else {
      alert('Please add all 7 images in order to print the full pdf ');
      // console.log(`Can print: ${canPrint}, ${this.gridImageTiles} `)
    }
  }

  // save partial pdf
  saveAsPdfPartial() {
    this.savePdfService.savePDF( {
      comments: this.commentsPdf,
      days: this.days,
      itinerary: this.itinerary$,
      payments: this.paymentsPdf,
      phoneNumbers: this.countriesPdf,
    }, 2, this.usedDays);
  }

  // function to check if object is an array
isArray(obj: any ) {
    return Array.isArray(obj);
 }

 updateItinerary() {
    console.log('does updateItinerary need to be called?');
  // this.itineraryRef$
  // .subscribe(it => {
  //   this.itinerary$ = it.payload.val();
  //   this.itinerary$[`key`] = it.key;
  // });
}

  ngOnDestroy() {
    // unsubscribe from observables to remove memory leaks
    delete this.daysRef$
    delete this.commentsRef$;
    delete this.paymentsRef$;
    delete this.itineraryRef$;
    delete this.clientRef$;
    delete this.agentRef$;

    this.paymentsSubscription$.unsubscribe()
    this.commentsSubscription$.unsubscribe()
    this.countriesSubscription$.unsubscribe();
  }
}
