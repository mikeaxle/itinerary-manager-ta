import {Component, OnInit} from '@angular/core';
import {Itinerary} from '../model/itinerary';
import {DataService} from '../data.service';
import {FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
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

  constructor(private formBuilder: FormBuilder,
              public data: DataService,
              public router: Router,
              public bottomSheetRef: MatBottomSheetRef<EditorComponent>) {
  }

  ngOnInit() {
    // initialize form group
    // todo: enable for production
    this.itineraryForm = this.formBuilder.group({
      agent: ['bYAgMEZt7eMNmbkht7Rcdncqeo42'],
      client: ['HJcOWb4dn0bwY0sQAljdECUAX5B3'],
      adults: [1],
      children: [1],
      children_ages: [1],
      title: ['Test'],
      startdate: [new Date('2019-10-03T22:00:00.000Z')],
      enddate: [new Date('2019-10-18T22:00:00.000Z')]
    });

    // test data
    // this.itineraryForm = this.formBuilder.group({
    //   agent: [null, Validators.required],
    //   client: [null, Validators.required],
    //   adults: [null, Validators.required],
    //   children: [null, Validators.required],
    //   children_ages: [null],
    //   title: [null, Validators.required],
    //   startdate: [null, Validators.required],
    //   enddate: [null, Validators.required]
    // });


    // get logged in user
    this.user = this.data.authenticateUser();

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
              Swal.fire('New Itinerary Added!');
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
