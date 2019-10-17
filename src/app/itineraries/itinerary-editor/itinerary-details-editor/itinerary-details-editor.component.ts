import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DataService} from '../../../services/data.service';
import Swal from 'sweetalert2';
import { snapshotChanges } from '@angular/fire/database';

// assign day in milliseconds
const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

@Component({
  selector: 'app-itinerary-details-editor',
  styleUrls: ['./itinerary-details-editor.component.css'],
  templateUrl: './itinerary-details-editor.component.html'
})
export class ItineraryDetailsEditorComponent implements OnInit, OnDestroy {
  TODAY = new Date();
  public itineraryForm: FormGroup;
  itinerary;
  clients = [];
  error: any;
  user: any;
  totalDays: any;
  color: any;
  agents = [];
  private startdate: Date;
  private enddate: Date;
  private agents$;
  private clients$;

  constructor(private formBuilder: FormBuilder,
              public data: DataService,
              public dialogRef: MatDialogRef<ItineraryDetailsEditorComponent>,
              @Inject(MAT_DIALOG_DATA) public params: any) { }


  ngOnInit() {
    this.color = localStorage.getItem('color');

    // get user
    this.user = this.data.user;

    // get itinerary
    this.itinerary = this.params.itinerary;

    // create start date and end date objects
    this.startdate = new Date(this.itinerary.startdate);
    this.enddate = new Date(this.itinerary.enddate);

    // init form
    this.itineraryForm = this.initItinerary();

    // calculate remaining days
    this.calculateDays();

    // subscribe to changes on itinerary form. calculate number of days
    this.itineraryForm
      .valueChanges
      .subscribe((val) => {
        this.calculateDays();
      });

    // get agents list
    this.agents$ = this.data.af.list('users')
      .snapshotChanges()
      .subscribe((snaphots) => {
        snaphots.forEach(snapshot => {
          const agent = snapshot.payload.val();
          agent[`key`] = snapshot.key;
          this.agents.push(agent);
        });
      });


    // get client list
    this.clients$ = this.data.getList(`clients/${localStorage.getItem('company')}/`)
      .snapshotChanges()
      .subscribe(snapshots => {
        snapshots.forEach(snapshot => {
          const client = snapshot.payload.val();
          client[`key`] = snapshot.key;
          this.clients.push(client);
        });
      });
  }

  // function to init itinerary
  initItinerary() {
    return this.formBuilder.group({
      adults: [this.itinerary.adults],
      agent: [this.itinerary.agent],
      children: [this.itinerary.children],
      children_ages: [this.itinerary.children_ages],
      client: [this.itinerary.client],
      enddate: [this.enddate],
      startdate: [this.startdate],
      title: [this.itinerary.title]
    });
  }

  // date filter for end date limits
  endDateFilter = (d: Date): boolean => {
    // convert to milliseconds
    const remainingDays = 1000 * 60 * 60 * 24 * (this.totalDays - this.params.usedDays);

    const date = this.itineraryForm.value.enddate.getTime() - remainingDays;

    // condition for selectable dates
    return d.getTime() >= date;
  }

  // date filter for start date limits
  startDateFilter = (d: Date): boolean => {
    // convert to milliseconds
    const remainingDays = 1000 * 60 * 60 * 24 * (this.totalDays - this.params.usedDays);

    const date = this.itinerary.startdate.getTime() + remainingDays;

    // condition for selectable dates
    return d.getTime() < date;
  }

  // function to calculate total days
  calculateDays() {
    // calculate total days
    this.totalDays = (this.itineraryForm.value.enddate.getTime() - this.itineraryForm.value.startdate.getTime()) / DAY_IN_MILLISECONDS;
    this.totalDays++;
  }

  // function to close dialog
  onCloseConfirm() {
    // console.log(this.itinForm.value.startdate.toDateString())

    // convert dates to date strings
    this.itineraryForm.value.startdate = this.itineraryForm.value.startdate.toDateString();
    this.itineraryForm.value.enddate = this.itineraryForm.value.enddate.toDateString();

    // if user is agent assign user id back to itinerary
    if (this.user.role === 'agent') {
      this.itineraryForm.value.agent = this.itinerary.agent;
    }

    // push to firebase
    this.data.updateItem(this.itinerary[`key`], `itineraries/${localStorage.getItem('company')}/`, this.itineraryForm.value)
      .then(() => {
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
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.agents$.unsubscribe();
    this.clients$.unsubscribe();
  }
}
