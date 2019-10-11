import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DataService} from '../../../services/data.service';

// assign day in milliseconds
const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24

@Component({
  selector: 'app-itinerary-details-editor',
  styleUrls: ['./itinerary-details-editor.component.css'],
  templateUrl: './itinerary-details-editor.component.html'
})
export class ItineraryDetailsEditorComponent implements OnInit {
  TODAY = new Date();
  public itinForm: FormGroup;
  agent: string;
  client: string;
  adults: number;
  children: number;
  title: string;
  startdate: any;
  enddate: any;
  status: any;
  numbers: any;
  agents: any;
  clients: any;
  error: any;
  itinerary: any;
  user: any;
  totalDays: any;
  color: any;

  constructor(private formBuilder: FormBuilder,
              public data: DataService,
              public dialogRef: MatDialogRef<ItineraryDetailsEditorComponent>,
              @Inject(MAT_DIALOG_DATA) public params: any) { }


  ngOnInit() {
    this.color = localStorage.getItem('color');

    // authenticate user
    this.user = this.data.user;
    // console.log(this.user)

    // subscribe to itinerary
    this.params.itinerary.map((res) => {
      // assign itinerary
      this.itinerary = res;

      // convert dates to date object for use in date picker
      this.startdate = new Date(res.startdate);
      this.enddate = new Date(res.enddate);
    })
      .subscribe();

    // init form
    this.itinForm = this.initItinerary();

    // calculate remaining days
    this.calculateDays();

    this.itinForm
      .valueChanges
      .subscribe((val) => {
        this.calculateDays();
      });

    // get agents list
    this.agents = this.data.af.list('users');

    // get client list
    this.clients = this.data.getList(`clients/${this.data.currentCompany}/`);

    // make numbers
    this.numbers = Array.from(Array(20).keys());
  }

  // function to init itinerary
  initItinerary() {
    return this.formBuilder.group({
      agent: [this.itinerary.agent],
      client: [this.itinerary.client],
      adults: [this.itinerary.adults],
      children: [this.itinerary.children],
      children_ages: [this.itinerary.children_ages],
      title: [this.itinerary.title],
      startdate: [this.startdate],
      enddate: [this.enddate]
    });
  }

  // date filter for end date limits
  endDateFilter = (d: Date): boolean => {
    // convert to milliseconds
    const _remainingDays = 1000 * 60 * 60 * 24 * (this.totalDays - this.params.usedDays);

    const _date = this.itinForm.value.enddate.getTime() - _remainingDays;

    // condition for selectable dates
    return d.getTime() >= _date;
  }

  // date filter for start date limits
  startDateFilter = (d: Date): boolean => {
    // convert to milliseconds
    const _remainingDays = 1000 * 60 * 60 * 24 * (this.totalDays - this.params.usedDays);

    const _date = this.itinForm.value.startdate.getTime() + _remainingDays;

    // condition for selectable dates
    return d.getTime() < _date;
  }

  // function to calculate total days
  calculateDays() {
    // calculate total days
    this.totalDays = (this.itinForm.value.enddate.getTime() - this.itinForm.value.startdate.getTime()) / DAY_IN_MILLISECONDS;
    this.totalDays++;
  }

  // function to close dialog
  onCloseConfirm() {
    // console.log(this.itinForm.value.startdate.toDateString())

    // convert dates to date strings
    this.itinForm.value.startdate = this.itinForm.value.startdate.toDateString();
    this.itinForm.value.enddate = this.itinForm.value.enddate.toDateString();

    // if user is agent assign user id back to itinerary
    if (this.user.role === 'agent') {
      this.itinForm.value.agent = this.itinerary.agent;
    }

    // push to firebase
    this.data.updateItem(this.itinerary.$key, `itineraries/${this.data.currentCompany}/`, this.itinForm.value)
      .then(() => {
        this.dialogRef.close();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // function to cancel dialog
  onCloseCancel() {
    this.dialogRef.close();
  }
}
