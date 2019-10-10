import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CountryService} from '../../../services/country.service';
import {Country} from '../../../model/country';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-add-country-number',
  templateUrl: './add-country-number.component.html',
  styleUrls: ['./add-country-number.component.css']
})
export class AddCountryNumberComponent implements OnInit {
  public addNumberForm: FormGroup;
  destinations: Country[];

  constructor(private formBuilder: FormBuilder,
              private countryService: CountryService,
              public data: DataService,
              public dialogRef: MatDialogRef<AddCountryNumberComponent>,
              @Inject(MAT_DIALOG_DATA) public params: any) { }

  ngOnInit() {

    // get destinations
    this.destinations = this.countryService.getCountries();

    // initialize form
    this.addNumberForm = this.initCountry();
  }

  // function to initialize form based on params
  initCountry() {
    // check mode and init form
    if (this.params.mode === 'add') {
      return this.formBuilder.group({
        country_id: [null, Validators.required],
        office_hours: [null],
        after_hours: [null],
        alt_after_hours: [null]
      });
    } else if (this.params.mode === 'edit') {
      // return prepopulated form
      return this.formBuilder.group({
        country_id: [this.params.country.country_id, Validators.required],
        office_hours: [this.params.country.office_hours],
        after_hours: [this.params.country.after_hours],
        alt_after_hours: [this.params.country.alt_after_hours]
      });
    }
  }

  // function to assign phone numbers to form after country is selected
  onCountrySelected(id: any) {
    const country = this.countryService.getDestination(id);
    try {
      this.addNumberForm.controls.office_hours.setValue(country.phone_numbers[0].number);
      this.addNumberForm.controls.after_hours.setValue(country.phone_numbers[1].number);
      this.addNumberForm.controls.alt_after_hours.setValue(country.phone_numbers[2].number);
    } catch (err) {
      console.log(err);
    }
  }

  // function to close dialog and write to firebase
  onCloseConfirm() {

    if (this.params.mode === 'edit') {
      // update existing item
      this.data.updateItem(this.params.country.$key, `phone_numbers/${this.params.id}`, this.addNumberForm.value)
        .then(() => {
          this.dialogRef.close();
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      // save new contact number
      this.data.saveItem(`phone_numbers/${this.params.id}`, this.addNumberForm.value)
        .then(() => {
          this.dialogRef.close();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  // function to cancel dialog
  onCloseCancel() {
    this.dialogRef.close();
  }

}
