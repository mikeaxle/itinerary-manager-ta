import {Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DataService} from '../../services/data.service';
import {CountryService} from '../../services/country.service';
import {Router, ActivatedRoute} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {SavePdfService} from '../../services/save-pdf.service';
import {DayEditorComponent} from './editors/day-editor/day-editor.component';
import {CommentEditorComponent} from './editors/comment-editor/comment-editor.component';
import {PaymentEditorComponent} from './editors/payment-editor/payment-editor.component';
import {ImageSelectorComponent} from './image-selector/image-selector.component';
import {CountryEditorComponent} from './editors/country-editor/country-editor.component';
import {ConfirmComponent} from '../../shared/confirm/confirm.component';
import {MONTHS} from '../../model/months';
import {EXCLUSIONS} from '../../model/exclusions';
import {CommonModule} from '@angular/common';
import {STATUS} from '../../model/statuses';
import {ItineraryDetailsEditorComponent} from './editors/itinerary-details-editor/itinerary-details-editor.component';
import Swal from 'sweetalert2';
import {generalInclusions} from '../../model/generalInclusions';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {CommentsPipe} from '../../filter/comments.pipe';

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
    country: null,
    region: null
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
  comments = [];
  payments = [];
  countries = [];
  itineraryId;
  itineraryRef$;
  commentsRef$;
  agentRef$;
  clientRef$;
  client: any;
  agent: any;
  paymentsSubscription$;
  averageCost;
  commentsSubscription$: any;
  countriesSubscription$;
  gridImageTiles =  [
    { imageUrl: false },
{ imageUrl: false },
{ imageUrl: false },
{ imageUrl: false },
{ imageUrl: false },
{ imageUrl: false },
];
  generalInclusions = generalInclusions;
  private daysSubscription$;
  private itinerarySubscription$;
  constructor(public router: Router, private route: ActivatedRoute, public data: DataService, public formbuilder: FormBuilder,
              public dialog: MatDialog, public savePdfService: SavePdfService, public snackBar: MatSnackBar,
              public http: HttpClient, public countryService: CountryService) {

  }

  // drop event to initiate reorder of days
  drop(event: CdkDragDrop<string[]>) {
    const previousDay = this.days[event.currentIndex];
    const day = this.days[event.previousIndex];

    // // change position to current index
    day[`position`] = event.currentIndex + 1;
    previousDay[`position`] = event.previousIndex + 1;


    // update previous dat
    this.data.updateFirebaseObject(`days/${day.key}`, day, 'day order');
    this.data.updateFirebaseObject(`days/${previousDay.key}`, previousDay, 'day order');
  }

  ngOnInit(): void {
    // get itinerary
    this.itineraryId = this.route.snapshot.paramMap.get('id');

    // get itinerary firebase reference
    this.itineraryRef$ = this.data.firestore.doc(`itineraries/${this.itineraryId}`);

    // subscribe to itinerary ref
    this.itinerarySubscription$ = this.itineraryRef$
      .snapshotChanges()
      .subscribe(_ => {
        if (_.payload.data()) {
          // get itinerary payload
          const it = _.payload.data();

          // get itinerary key
          it[`key`] = _.payload.id;

          // assign to local itinerary object for manipulation
          this.itinerary$ = it;

          // assign exclusions if not defined
          this.itinerary$[`exclusions`]  = this.itinerary$[`exclusions`] ? this.itinerary$[`exclusions`] : this.exclusions;


          // set grid image tiles
          if (it.gridImageTiles) {
            this.gridImageTiles = it.gridImageTiles;
          }

          // check if general inclusions are present on itinerary
          if (!it.generalInclusions) {
            this.itinerary$[`generalInclusions`] = this.generalInclusions;
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
          this.getContactNumbers();
        }
      });



  }

  // calculates total days assigned to itinerary
  private calculateDays(itinerary) {
    /* calculate total days by converting dates into milliseconds, subtracting and divide by 86400000 which is the number of milliseconds equal to a editor-components */
    this.totalDays = Math.round((Date.parse(itinerary.endDate) - Date.parse(itinerary.startDate)) / 86400000);
    this.totalDays++;
  }

// get contact numbers to associated countries related to itinerary
  // todo: move contract numbers to itinerary.contactNumbers
  private getContactNumbers() {
    this.countriesRef$ = this.data.firestore.collection(`itineraryContactDetails`, ref => ref.where('itinerary', '==', this.itineraryRef$.ref));
    this.countriesSubscription$ = this.countriesRef$
      .snapshotChanges()
      .subscribe(_ => {
      if (_.length > 0) {
        this.countries = [];
        _.forEach(snapshot => {
          const country = snapshot.payload.doc.data();
          country.key = snapshot.payload.doc.id;
          this.countries.push(country);
        });
      }

    });
  }

  // get payments related to itinerary
  private getPayments(itinerary) {
    // init payments firebase list reference
    this.paymentsRef$ = this.data.firestore.collection('payments', ref => ref.where('itinerary', '==', this.itineraryRef$.ref));

    // init payments subscription
    this.paymentsSubscription$ = this.paymentsRef$
      .snapshotChanges()
      .subscribe(_ => {
      // reset payments
      if (_.length > 0) {
        //
        this.payments = [];
        this.totalPayments = 0;
        this.averageCost = 0;

        _.forEach(snapshot => {
          const payment = snapshot.payload.doc.data();
          payment.key = snapshot.payload.doc.id;

          // increment total payments
          this.totalPayments += parseFloat(payment.amount);

          // add to array for pdf
          this.payments.push(payment);
        });

        // calculate average
        this.averageCost = itinerary.total / parseFloat(itinerary.children.length + itinerary.adults.length);
      }
      });
  }

  // get comments related to itinerary
  private getComments(dayRef) {
    // get comment ref
    this.commentsRef$ = this.data.firestore.collection('comments', ref => ref.where('day', '==', dayRef));

    // get comments and assign to local array
    this.commentsSubscription$ = this.commentsRef$
      .snapshotChanges()
      .subscribe(_ => {
        if (_.length > 0) {
          this.comments = [];
          _.forEach(snapshot => {
            const comment = snapshot.payload.doc.data();
            comment.key = snapshot.payload.doc.id;
            this.comments.push(comment);
          });
        }
    });
  }

  // get days related to itinerary
   private  getDays() {
    this.daysRef$ = this.data.firestore.collection('days', ref => ref.where('itinerary', '==', this.itineraryRef$.ref).orderBy('position'));

    this.daysSubscription$ = this.daysRef$
      .snapshotChanges()
      .subscribe(_ => {
        // reset temp inclusions array, used days and temp days array
        const _INCLUSIONS = [];
        this.usedDays = 0;
        this.days = [];

        // assign days array
        _.forEach((data) => {
          // get day-editor
          const day = data.payload.doc.data();

          // add key
          day[`key`] = data.payload.doc.id;

          // add title
          day[`title`] = this.getDayTitle('title', day);

          // add dates
          day[`dates`] = this.getDayTitle('dates', day);

          // get comments relate to day
          this.comments = [];
          this.getComments(this.data.firestore.doc(`days/${day[`key`]}`).ref);

          // add days to find out how many days are used
          this.usedDays += Math.round(parseInt(day[`days`], 10));

          // iterate days and store all inclusions from all accommodations in array
          // check if accommodation is present for day-editor
          if (day[`accommodation`] !== undefined) {
            // iterate accommodation
            day[`accommodation`].forEach(accommodation => {
              // copy day-editor key into inclusions array
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

// function to remove editor-components
  removeDay(key) {
    this.data.deleteObjectFromFirebase(`days/${key}`, 'day');
  }

  // function to remove comment
  removeComment(key: string) {
    this.data.deleteObjectFromFirebase(`comments/${key}`, 'comment');
  }

// function to delete payment
  removePayment(key: string) {
    this.data.deleteObjectFromFirebase(`payments/${key}`, 'payment');
  }

  // function to delete country
  removeCountry(key) {
    this.data.deleteObjectFromFirebase(`itineraryContactDetails/${key}`, 'contact');
  }

  // gets agent object
  getAgent() {
    // use agent ref from itinerary to get agent
    this.itinerary$.agent.get()
      .then(_ => {
        // assign agent object
        this.agent = _.data();
      });
  }

  // gets client
  getClient() {
    // use client ref from itinerary to get client
    this.itinerary$.client.get()
      .then(_ => {
        this.client = _.data();
      });
  }

  // function to generate editor-components title
  getDayTitle(type: string, day: any) {
    // variables related to editor-components tile
    let title = '';
    let firstDay = 0;
    let lastDay = 0;

    // variables related to dates
    let startDate: any;
    let endDate: any;
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

    // init start date to itinerary start date
    startDate = new Date(this.itinerary$.startDate);

    // add number of days before current editor-components to start date to get current start date
    startDate.setDate(startDate.getDate() + (firstDay - 1));

    // add start_date to date string
    dates += `${startDate.getDate()} ${this.DATE_MONTHS[startDate.getMonth()]}`;

    // if editor-components contains more than 1 editor-components
    if (day.days > 1) {
      // last editor-components is first editor-components + total days - 1
      lastDay = firstDay + day.days - 1;

      // add last editor-components to title
      title += ` - ${lastDay}`;

      // init end_date to start_date
      endDate = startDate;

      // add number of days
      endDate.setDate(endDate.getDate() + day.days - 1);

      // add to dates string
      dates += ` - ${endDate.getDate()} ${this.DATE_MONTHS[endDate.getMonth()]}`;
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
    this.itinerary$.total === 0 ? balance = 0 : balance = (this.itinerary$.total - this.itinerary$.discount) - this.totalPayments;

    // return balance
    return balance;
  }

  // function to open dialog
  openDayDialog(mode: string, day: any) {
    let dialogRef: any;

    // variable to store editor-components position
    const position = this.days.length + 1;

    if (mode === 'add') {

      dialogRef = this.dialog.open(DayEditorComponent, {
        data: {
          itineraryId: this.itinerary$.key,
          lastUsedParams: this.lastUsedParams,          // pass object with days array and previously used country + region
          mode,
          position,
          remainingDays: this.totalDays - this.usedDays,            // pass remaining days
        },
        width: '60vw',
        maxHeight: '80vh'
      });

    } else if (mode === 'edit') {

      dialogRef = this.dialog.open(DayEditorComponent, {
        data: {
          day,                                      // editor-components object
          itineraryId: this.itineraryId,
          lastUsedParams: this.lastUsedParams,          // pass object with days array and previously used country + region
          mode,
          remainingDays: this.remainingDays,            // pass remaining days
        },
        width: '60vw',
        maxHeight: '80vh'
      });
    }


    // after dialog is close
    dialogRef.afterClosed().subscribe(result => {
      // check for days
      if (result) {
        // reassign previously used country and editor-components
        this.lastUsedParams = result.lastUsedParams;

        // mode is add
        if (mode === 'add') {
          // add position to day form
          result.dayForm.position = position;

          // add itinerary ref to day form
          result.dayForm.itinerary = this.itineraryRef$.ref;

          // push new day form as days to dayRef$
          this.daysRef$.add(result.dayForm);

        } else if (mode === 'edit') {
          // update day
          this.data.updateFirebaseObject(`days/${day.key}`, result.dayForm, 'days');
        }
      }
    });
  }

  // function to open comment dialog
  openCommentDialog(mode: string, comment: any) {
    // declare dialog reference
    let dialogRef: any;

    // check if add or edit mode
    if (mode === 'add') {
      // open comment modal in add mode
      dialogRef = this.dialog.open(CommentEditorComponent, {
        data: {
          comment: null,
          days: this.days,
          itineraryId: this.itinerary$.key,
          mode: 'add',
        },
        width: '480px'
      });
    } else if (mode === 'edit') {
      // open modal in edit mode
      dialogRef = this.dialog.open(CommentEditorComponent, {
        data: {
          comment,
          days: this.days,
          itineraryId: this.itineraryId,
          mode: 'edit'
        },
        width: '480px'
      });
    }


    // function to run after dialog is close
    dialogRef.afterClosed().subscribe(commentRes => {
      // check for comment-editor
      if (commentRes) {
        // add day ref
        // commentRes.day = this.data.firestore.doc(`days/${commentRes.day}`).ref;
        // save to firebase comments list
        if (mode === 'add') {
          this.commentsRef$.add(commentRes);
          console.log('comment added');
        } else if (mode === 'edit') {
          // this.commentsRef$.update(comment.key, commentRes);
          this.data.updateFirebaseObject(`comments/${comment.key}`, commentRes, 'comment');
        }
      }
    });
  }

  // function to open payment-editor dialog
  openPaymentDialog(mode: string, data: any) {
    let dialogRef: any;
    // check mode
    if (mode === 'add') {
      dialogRef = this.dialog.open(PaymentEditorComponent, {
        data: {
          id: this.itineraryId,
          mode,
        },
        width: '480px'
      });
    } else if (mode === 'edit') {
      dialogRef = this.dialog.open(PaymentEditorComponent, {
        data: {
          id: this.itineraryId,
          mode,
          payment: data
        },
        width: '480px'
      });
    }

    // function to run after dialog is close
    dialogRef.afterClosed()
      .subscribe(payment => {
        if (payment) {
          // add itinerary ref to payment
          payment.itinerary = this.itineraryRef$.ref;
          // convert date to date string
          if (mode === 'edit') {
            // convert date object to string
            payment.date = payment.date.toDateString();

            // write payment-editor to firebase
            // this.paymentsRef$.update(data.key, payment)
            this.data.updateFirebaseObject(`payments/${data.key}`, payment, 'payment');
          }

          if (mode === 'add') {
            payment.date = payment.date.toDateString();
            // write payment-editor to firebase
            this.paymentsRef$.add(payment)
              .then(() => {
                console.log('payment added');
              })
              .catch((error) => {
                console.log(error);
                Swal.fire('Payment Editor', 'Adding new payment-editor failed', 'error');
              });
          }
        }
      });
  }

  // open country number adding dialog
  openCountryDialog(mode: string, data: any) {
    let dialogRef: any;

    if (mode === 'add') {
      dialogRef = this.dialog.open(CountryEditorComponent, {
        data: { id: this.itinerary$.key, mode },
        width: '580px',

      });
    } else {
      dialogRef = this.dialog.open(CountryEditorComponent, {
        data: {
          country: data,
          id: data.key,
          mode
        },
        width: '580px',
      });
    }

    // function to run after dialog is closed
    dialogRef.afterClosed()
      .subscribe(country => {
        country.itinerary = this.itineraryRef$.ref;
        if (country) {
          if (mode === 'edit') {
            // update existing item
            this.data.updateFirebaseObject(`itineraryContactDetails/${data.key}`, country, 'itinerary contact details');
          } else {
            // save new contact number
            this.data.saveFirebaseObject('itineraryContactDetails', country, 'itinerary contact details');
          }
        }
      });
  }

  // function to open image selector dialog
  openImageSelector(gridImage, index) {
    const dialogRef = this.dialog.open(ImageSelectorComponent, {
      height: '600px',
      width: '1000px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const objectToWrite = {};

        // check name of image
        if (index < 0) {
          // assign image url to selected grid image
          gridImage = result;
          // prepare object to write to firebase
          objectToWrite[`coverImageTile`] = gridImage;
        } else {

          // save item
          gridImage = result;

          // push to local array
          this.gridImageTiles[index] = gridImage;
          // console.log(this.gridImageTiles)

          // prepare object to write to firebase
          objectToWrite[`gridImageTiles`] = this.gridImageTiles;

          // console.log(objectToWrite)
          }

          // write to firebase
        this.itineraryRef$.update(objectToWrite)
            .then(_ => {
              console.log('media item attached');
            })
            .catch(err => {
              console.log(err);
              Swal.fire('Media Selector', 'adding media failed', 'error');
            });
        }
      });
  }

  // function to edit itinerary booking details
  openEditItinerary() {
    const dialogRef = this.dialog.open(ItineraryDetailsEditorComponent, {
      data: {
        agent: this.agent,
        client: this.client,
        itinerary: this.itinerary$,
        usedDays: this.usedDays
      }
    });
  }

  // function to open confirm delete dialog
  openDelete() {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: this.itinerary$.title,
      width: '480px'
    });

    dialogRef.afterClosed().subscribe((yes) => {
      // if result is true, delete itinerary
      if (yes) {
        this.deleteItinerary();
      }
    });
  }

  // function to delete image
  // TODO: write function to delete image from grid
  deleteImage() {
    console.log('delete image');
  }

  // function to save inclusion edits to firebase on blur or press enter
  onKeyUpInclusions(event: any, accommodation: any) {
    // add updated inclusion to accommodation
    accommodation.inclusions = event.target.value;


    this.data.updateFirebaseObject(`days/${accommodation.day}`, { accommodation: [accommodation] }, 'inclusions');
    // update inclusion
    // this.data.firestore.doc(`days/${accommodation.day}`)
    //   .update({
    //     accommodation: [
    //       accommodation
    //     ]
    //   });
      // event.target.value, 'inclusion');
  }


// function to save quote details to firebase on blur or press enter
  onKeyUpSave(type: string) {
    // check which control called the function
    switch (type) {
      case 'total':
        this.data.updateFirebaseObject(`itineraries/${this.itineraryId}`,
          { total: this.itinerary$.total },
          'itinerary total');
        break;
      case 'deposit':
        this.data.updateFirebaseObject(`itineraries/${this.itineraryId}`,
          { deposit: this.itinerary$.deposit },
          'itinerary deposit');
        break;
      case 'discount':
        this.data.updateFirebaseObject(`itineraries/${this.itineraryId}`,
          { discount: this.itinerary$.discount },
          'itinerary discount');
        break;
      case 'exclusions':
        this.data.updateFirebaseObject(`itineraries/${this.itineraryId}`,
          { exclusions: this.itinerary$.exclusions },
          'exclusions');
        break;
      case 'generalInclusions':
        this.data.updateFirebaseObject(`itineraries/${this.itineraryId}`,
          { generalInclusions: this.itinerary$.generalInclusions },
          'general inclusions');
        break;
      default:
        break;
    }
  }

  // function to write status to firebase when status is selected
  onSelect(status: any) {
    this.data.updateFirebaseObject(`itineraries/${this.itineraryId}`, { status }, 'itinerary status');
  }

  // function to delete itinerary
  deleteItinerary() {
    // todo: write cloud function to delete any comments, payments, days and contact numbers that have a null itinerary ref
    // delete itinerary
    this.itineraryRef$.delete()
      .then(_ => {
        // Swal
        Swal.fire('Delete Itinerary', `Itinerary ${this.itineraryId} Deleted`, 'success')
          .then(() => {
            // go to itineraries page
            this.router.navigate(['/itineraries']);
          });
      })
      .catch(err => {
        // Swal
        Swal.fire('Delete Itinerary', err.message, 'error');
      });
  }

  // function to duplicate itinerary
  duplicateItinerary() {

    // todo: fix duplicate bug

    // variable to store duplicate
    let duplicate;

      // copy data to duplicate
    duplicate = this.itinerary$;

      // add the word duplicate to title of duplicate
    duplicate.title += '(duplicate)';

    // write duplicate itinerary to
    this.data.firestore.collection(`itineraries`)
      .add(duplicate)
      .then(newItinerary => {
        // update new itinerary invoice number
        newItinerary.update({
          invoiceNumber: ++this.itinerary$.invoiceNumber
        });

        //  get new itinerary Ref
        const newItineraryRef = this.data.firestore.doc(`itineraries/${newItinerary.id}`).ref;
        // loop thru days
        this.days.forEach(day => {

          // change day reference
          day.itinerary = newItineraryRef;

          // write to firestore
          this.data.firestore.collection(`days`).add(day)
            .then(newDay => {
              // loop thru comments array
              this.comments.forEach(comment => {

                // check if comment matches day
                if (comment.day.id === day.key) {

                  // update day key to duplicate Day ref
                  comment.day = this.data.firestore.doc(`days/${newDay.id}`).ref;

                  // write to firebase
                  this.data.firestore.collection(`comments`).add(comment);
                }
              });
            });
        });

        // loop thru payments
        this.payments.forEach(payment => {
          // change itinerary key to duplicate  key
          payment.itinerary = newItineraryRef;

          // write to firestore
          this.data.firestore.collection(`payments`).add(payment);
        });

        // loop thru countries
        this.countries.forEach(country => {
          // change itinerary key to duplicate  key
          country.itinerary = newItineraryRef;

          // write to firestore
          this.data.firestore.collection(`itineraryContactDetails`).add(country);
        });

        // update invoice number
        this.data.firestore.doc(`companies/${this.data.company.key}`)
          .update({
            invoiceNumber: ++this.itinerary$.invoiceNumber
          });



        Swal.fire('Duplicate Itinerary', 'Itinerary copied successfully', 'success')
          .then(fire => {
            // go to new itinerary
            this.router.navigate(['/itinerary-editor', newItinerary.id])
          });
      })
      .catch(err => {
        console.log(err);
        Swal.fire('Duplicate Itinerary', err.message, 'error');
      });
  }

  // function to save as PDF
  saveAsPdf(type: number) {
    // flag to determine if printing is possible
    let canPrint = false;

    // check if cover image is specified
    if (this.itinerary$.coverImageTile) {
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
        this.savePdfService.savePDF({
          agent: this.agent,
          comments: this.comments,
          days: this.days,
          itinerary: this.itinerary$,
          payments: this.payments,
          phoneNumbers: this.countries,
          totalPayments: this.totalPayments
        }, type, this.usedDays);
    } else {
      Swal.fire('Generate PDF', 'Please add all 7 images in order to print the full pdf', 'error');
      // console.log(`Can print: ${canPrint}, ${this.gridImageTiles} `)
    }
  }

  // save partial pdf
  saveAsPdfPartial() {
    this.savePdfService.savePDF( {
      agent: this.agent,
      comments: this.comments,
      days: this.days,
      itinerary: this.itinerary$,
      payments: this.payments,
      phoneNumbers: this.countries,
      totalPayments: this.totalPayments
    }, 1, this.usedDays);
  }

  ngOnDestroy() {
    // unsubscribe from observables to remove memory leaks
    delete this.daysRef$;
    delete this.commentsRef$;
    delete this.paymentsRef$;
    delete this.itineraryRef$;
    delete this.clientRef$;
    delete this.agentRef$;

    this.itinerarySubscription$ ? this.itinerarySubscription$.unsubscribe() : console.log('deleted');
    this.paymentsSubscription$ ? this.paymentsSubscription$.unsubscribe() : console.log('deleted');
    this.commentsSubscription$ ? this.commentsSubscription$.unsubscribe() : console.log('deleted');
    this.countriesSubscription$ ? this.countriesSubscription$.unsubscribe() : console.log('deleted');
  }
}
