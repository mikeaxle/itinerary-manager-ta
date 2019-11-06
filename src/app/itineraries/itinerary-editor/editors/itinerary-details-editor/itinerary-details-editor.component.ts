import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DataService} from '../../../../services/data.service';
import Swal from 'sweetalert2';
import { snapshotChanges } from '@angular/fire/database';
import {Passenger} from '../../../../model/passenger';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

// assign day-editor in milliseconds
const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

@Component({
  selector: 'app-itinerary-details-editor',
  styleUrls: ['./itinerary-details-editor.component.css'],
  templateUrl: './itinerary-details-editor.component.html'
})
export class ItineraryDetailsEditorComponent implements OnInit, OnDestroy {
  TODAY = new Date();
  itineraryForm: any;
  itinerary;
  error: any;
  user: any;
  totalDays: any;
  private startDate: Date;
  private endDate: Date;
  private agent;
  private client;
  formRef$;
  adults;
  children;
  numbers = Array.from(Array(20).keys());
  private agents = [];
  private agentsSubscription$;
  private clients = [];
  private clientsSubscription$;
  private filteredClients: Observable<any[]>;

  constructor(private formBuilder: FormBuilder,
              public data: DataService,
              public dialogRef: MatDialogRef<ItineraryDetailsEditorComponent>,
              @Inject(MAT_DIALOG_DATA) public params: any) { }

  // getter to return filtered country codes
  private _filterClients(value): any[] {
    const filterValue = value.toLowerCase();
    return this.clients.filter(client => `${client.firstName} ${client.lastName}`.toLowerCase().indexOf(filterValue) === 0);
  }

  ngOnInit() {
    // init itinerary form
    this.itineraryForm = this.formBuilder.group({
      adults: this.formBuilder.array([]),
      agent: [null, Validators.required],
      children: this.formBuilder.array([]),
      client: [null, Validators.required],
      endDate: [null, Validators.required],
      startDate: [null, Validators.required],
      title: [null, Validators.required]
    });

    // get user
    this.user = this.data.user;

    // get itinerary
    this.itinerary = this.params.itinerary;

    // set adults
    this.adults = this.itinerary.adults.length;

    // set children
    this.children = this.itinerary.children.length;

    // get agents
    this.agentsSubscription$ = this.data.firestore.collection('users')
      .snapshotChanges()
      .subscribe(_ => {
        if (_.length > 0) {
          this.agents = [];
          _.forEach(__ => {
            const agent = __.payload.doc.data();
            agent[`key`] = __.payload.doc.id;
            this.agents.push(agent);
          });
        }
      });

    // set agent
    this.itinerary.agent = this.itinerary.agent.id;

    // get clients
    const companyRef$ = this.data.firestore.doc(`companies/${this.data.company.key}`).ref;
    this.clientsSubscription$ = this.data.firestore.collection(`clients`, ref => ref.where('company', '==', companyRef$))
      .snapshotChanges()
      .subscribe(_ => {
        if (_.length > 0) {
          this.clients = [];
          _.forEach(__ => {
            const client = __.payload.doc.data();
            client[`key`] = __.payload.doc.id;
            this.clients.push(client);
          });
        }
      });

    // set client
    this.itinerary.client = this.itinerary.client.id;

    //  get from params
    this.client = this.params.client;

    // create start date and end date objects
    this.startDate = new Date(this.itinerary.startDate);
    this.endDate = new Date(this.itinerary.endDate);

    // init form
    this.initItinerary();


    // calculate remaining days
    // this.calculateDays();

    // subscribe to changes on itinerary form. calculate number of days
    // this.formRef$ = this.itineraryForm
    //   .valueChanges
    //   .subscribe((val) => {
    //     this.calculateDays();
    //   });

  }

  // function to init itinerary
  initItinerary() {
    // check for adult passengers
    if (this.adults > 0) {
      // get adults array
      const adultsControl = this.adultsArray;

      // populate adults array
      this.itinerary.adults.forEach(adult => {
        adultsControl.push(this.patchValue(adult));
      });
    }

    // check for children passengers
    if (this.children > 0) {
      // get children array
      const childrenControl = this.childrenArray;

      // populate children array
      this.itinerary.children.forEach(child => {
        childrenControl.push(this.patchValue(child));
      });
    }

    this.itineraryForm.patchValue({
      agent: this.itinerary.agent,
      client: this.itinerary.client,
      endDate: this.endDate,
      startDate: this.startDate,
      title: this.itinerary.title
    });

    // init filtered clients  and subscribe to client form control on itinerary form
    this.filteredClients = this.itineraryForm.controls.client
      .valueChanges
      .pipe(
        startWith(''),
        map(client => client ? this._filterClients(client) : this.clients.slice()));
  }

  // patch values to form array control
  patchValue(passenger) {
    return this.formBuilder.group({
      adult: passenger.adult,
      age: passenger.age,
      firstName: passenger.firstName,
      lastName: passenger.lastName
    });
  }

  // date filter for end date limits
  endDateFilter = (d: Date): boolean => {
    // convert to milliseconds
    const remainingDays = 1000 * 60 * 60 * 24 * (this.totalDays - this.params.usedDays);

    const date = this.itineraryForm.value.endDate.getTime() - remainingDays;

    // condition for selectable dates
    return d.getTime() >= date;
  }

  // date filter for start date limits
  startDateFilter = (d: Date): boolean => {
    // convert to milliseconds
    const remainingDays = 1000 * 60 * 60 * 24 * (this.totalDays - this.params.usedDays);

    const date = this.itinerary.startDate.getTime() + remainingDays;

    // condition for selectable dates
    return d.getTime() < date;
  }


  // function to calculate total days
  calculateDays() {
    // calculate total days
    this.totalDays = (this.itineraryForm.value.endDate.getTime() - this.itineraryForm.value.startDate.getTime()) / DAY_IN_MILLISECONDS;
    this.totalDays++;
  }

  // function to close dialog
  onCloseConfirm() {

    // convert dates to date strings
    this.itineraryForm.value.startDate = this.itineraryForm.value.startDate.toDateString();
    this.itineraryForm.value.endDate = this.itineraryForm.value.endDate.toDateString();

    // add agent ref
    this.itineraryForm.value.agent = this.data.firestore.doc(`users/${this.itineraryForm.value.agent}`).ref;

    // add client ref
    this.itineraryForm.value.client = this.data.firestore.doc(`clients/${this.itineraryForm.value.client}`).ref;

    console.log(this.itineraryForm.value)
    // push to firebase
    this.data.firestore.doc(`itineraries/${this.itinerary.key}`)
      .update(this.itineraryForm.value)
      .then(() => {
        this.itineraryForm.reset()
        Swal.fire('Itinerary Editor', 'Itinerary details updated', 'success');
        this.dialogRef.close();
      })
      .catch((error) => {
        Swal.fire('Itinerary Editor', error.message, 'error');
        console.log(error);
      });
  }

  // function to cancel dialog
  onCloseCancel() {
    // close dialog
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    // unsubscribe from form
    // this.formRef$.unsubscribe();
  }

  // convenience getters for easy access to form fields
  get f() {
    return this.itineraryForm.controls;
  }

  get adultsArray() {
    return this.f.adults as FormArray;
  }

  get childrenArray() {
    return this.f.children as FormArray;
  }

  // adds new form control to a FormArray
  addFormControl() {
    return this.formBuilder.group(new Passenger('', '', 0, false));
  }

  // function to handle number of adults change change
  onChangePassengers(event, adult) {
    // get the number of specified customers from event
    const passengerCount = event.value || 0;

    const passengers = adult ? this.adultsArray : this.childrenArray;

    if (passengers.length < passengerCount) {
      for (let count = passengers.length; count < passengerCount; count++) {
        passengers.push(this.addFormControl());
      }
    } else {
      for (let count = passengers.length; count >= passengerCount; count--) {
        passengers.removeAt(count);
      }
    }
  }
}
