import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-payment',
  styleUrls: ['./payment.component.css'],
  templateUrl: './payment.component.html'

})
export class PaymentComponent implements OnInit {
  public paymentForm: FormGroup;
  itineraryId: any;
  payment: any;
  date: Date;


  constructor(private formBuilder: FormBuilder,
              public data: DataService,
              public dialogRef: MatDialogRef<PaymentComponent>,
              @Inject(MAT_DIALOG_DATA) public params: any) { }


  ngOnInit() {


    // get itinerary id
    this.itineraryId = this.params.id;

    // get payment from params if mode is edit
    if (this.params.mode === 'edit') {
      this.payment = this.params.payment;

      this.date = new Date(this.payment.date);
    }

    // init payment form
    this.paymentForm = this.initPayment();
  }

  // function to init payment form
  initPayment() {
    if (this.params.mode === 'add') {
      return this.formBuilder.group({
        amount: [null, Validators.required],
        date: [null, Validators.required],
      });

    } else if (this.params.mode === 'edit') {
      return this.formBuilder.group({
        amount: [this.payment.amount, Validators.required],
        date: [this.date, Validators.required],
      });
    }
  }

  // function to close dialog
  onCloseConfirm() {
    this.dialogRef.close(this.paymentForm.value);
  }

  // function to cancel dialog
  onCloseCancel() {
    this.dialogRef.close();
  }
}
