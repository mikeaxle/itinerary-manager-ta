import {Component, Inject, OnInit} from '@angular/core';
import {Itinerary} from '../../model/itinerary';
import {DataService} from '../../services/data.service';
import {FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editor',
  styleUrls: ['./editor.component.css'],
  templateUrl: './editor.component.html'
})

export class EditorComponent implements OnInit {
  itineraryForm: any;
  itinerary: Itinerary;
  numbers: any;
  agents: any;
  clients: any;
  error: any;
  user: any;
  invoiceDetails: any;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public args: any,
              private formBuilder: FormBuilder,
              public data: DataService,
              public router: Router,
              public bottomSheetRef: MatBottomSheetRef<EditorComponent>) {
  }

  ngOnInit() {
    // get logged in user
    this.user = this.data.authenticateUser();

    // check if creating new item
    if (this.args.new) {
      switch (this.args.type) {
        case 'itinerary':
          console.log('itinerary');
          this.initNewItinerary();
          break;
        case 'clients':
          console.log('clients');
          break;
        case 'inventory':
          console.log('inventory');
          break;
        case 'agents':
          console.log('agents');
          break;
        case 'media':
          console.log('media');
          break;
        default:
          return;
      }
    }
  }

  // initialize new itinerary form
  initNewItinerary() {
    this.itineraryForm = this.formBuilder.group({
      adults: [null, Validators.required],
      agent: [null, Validators.required],
      children: [null, Validators.required],
      children_ages: [null],
      client: [null, Validators.required],
      enddate: [null, Validators.required],
      startdate: [null, Validators.required],
      title: [null, Validators.required]
    });

    // get company invoice details
    this.data.af.object(`companies/${this.data.currentCompany}`)
      .valueChanges()
      .subscribe((res) => {
        // this.data.list('company/True Africa')
        // @ts-ignore
        this.invoiceDetails = {prefix: res.prefix, invoice_number: res.invoice_number};
      });

    // get agents list
    this.data.af.list('users')
      .valueChanges()
      .subscribe((res) => {
        this.agents = res;
      });

    // get client list
    this.data.af.list(`clients/${this.data.currentCompany}/`)
      .valueChanges()
      .subscribe(res => {
        this.clients = res;
      });

    // make numbers
    this.numbers = Array.from(Array(20).keys());
  }

  // initialize new client form
  initNewClient() {

  }

  // initialize new inventory form
  initNewInventory() {

  }

  // initialize new agent form
  initNewAgent() {

  }

  // initialize new media form
  initNewMediaItem() {

  }

  // function to validate
  validateForm(): boolean {
    let valid = true;

    if (this.itineraryForm.valid) {
      // check if there are any children added
      if (this.itineraryForm.value.children === 0) {
        valid = false;
      } else {
        if (this.itineraryForm.value.children.children_ages === null) {
          valid = true;
        }
      }
    }
    return valid;
  }

  // function to add new agent
  addItinerary(itinerary: any) {
    console.log(this.itineraryForm.value);

    if (this.itineraryForm.valid) {

      // convert dates to date strings
      this.itineraryForm.value.startdate = this.itineraryForm.value.startdate.toDateString();
      this.itineraryForm.value.enddate = this.itineraryForm.value.enddate.toDateString();

      // if (this.user.role === 'agent') {
      //   formData.value.agent = this.user.$key
      // }

      // add status field to formData
      this.itineraryForm.value.status = 'Draft';

      // increment invoice number
      this.invoiceDetails.invoice_number += 1;

      // add invoice number to itinerary
      this.itineraryForm.value.invoice_number = `${this.invoiceDetails.prefix}-${this.invoiceDetails.invoice_number}`;

      // push to firebase
      this.data.saveItem(`itineraries/${this.data.currentCompany}`, this.itineraryForm.value)
        .then((res) => {
          // update invoice number in firebase
          this.data.updateItem(this.data.currentCompany, 'companies', this.invoiceDetails);
          // go to itinerary editor with new itinerary
          this.router.navigate(['itinerary-editor', { queryParams: {itineraryData: itinerary }} ])
            .then(() => {
              Swal.fire('Success!', 'New Itenerary Successfully Addes', 'success');
              }
            );

          this.bottomSheetRef.dismiss();
        })
        .catch((error) => {
          console.log(error);
          // assign error to variable
          this.error = error;
        });

    }
  }
}
