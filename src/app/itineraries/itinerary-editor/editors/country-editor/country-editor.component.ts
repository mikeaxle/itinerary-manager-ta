import { countries } from './../../../../model/countries';

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../../../services/data.service';

@Component({
  selector: 'app-add-country-number',
  templateUrl: './country-editor.component.html',
  styleUrls: ['./country-editor.component.css']
})
export class CountryEditorComponent implements OnInit {
  public addNumberForm: FormGroup;
  destinations = [];
  ref;

  constructor(private formBuilder: FormBuilder,
    public data: DataService,
    public dialogRef: MatDialogRef<CountryEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public params: any) { }

  ngOnInit() {

    // get destinations
    this.ref = this.data.firestore.collection('countries')
      .snapshotChanges()
      .subscribe(_ => {
        _.forEach(__ => {
          const country = __.payload.doc.data();
          country[`key`] = __.payload.doc.id;
          this.destinations.push(country);
        })
      })

    // initialize form
    this.addNumberForm = this.initCountry();
  }

  // function to initialize form based on params
  initCountry() {
    // check mode and init form
    if (this.params.mode === 'add') {
      return this.formBuilder.group({
        country: [null, Validators.required],
        officeHours: [null],
        afterHours: [null],
        altAfterHours: [null]
      });
    } else if (this.params.mode === 'edit') {
      // return prepopulated form
      return this.formBuilder.group({
        country: [this.params.country.country, Validators.required],
        officeHours: [this.params.country.officeHours],
        afterHours: [this.params.country.afterHours],
        altAfterHours: [this.params.country.altAfterHours]
      });
    }
  }

  // function to assign phone numbers to form after country is selected
  onCountrySelected(id: any) {
    const country = this.destinations.find(destination => destination.key === id);

    if (country.phoneNumbers[0]) {
      this.addNumberForm.controls.officeHours.setValue(country.phoneNumbers[0].number);

    }

    if (country.phoneNumbers[1]) {
      this.addNumberForm.controls.afterHours.setValue(country.phoneNumbers[1].number);
    }

    if (country.phoneNumbers[2]) {
      this.addNumberForm.controls.altAfterHours.setValue(country.phoneNumbers[2].number);
    }
  }

  // function to close dialog and write to firebase
  onCloseConfirm() {
    this.dialogRef.close(this.addNumberForm.value);
  }

  // function to cancel dialog
  onCloseCancel() {
    this.dialogRef.close();
  }

}
