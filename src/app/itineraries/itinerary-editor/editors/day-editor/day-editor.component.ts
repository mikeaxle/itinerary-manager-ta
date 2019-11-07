import {Component, Inject, OnInit, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CountryService} from '../../../../services/country.service';
import {Country} from '../../../../model/country';
import {Region} from '../../../../model/region';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-day',
  styleUrls: ['./day-editor.component.css'],
  templateUrl: './day-editor.component.html'
})
export class DayEditorComponent implements OnInit, OnDestroy {

  public dayForm: FormGroup;
  day: any;
  inventory = [];
  destinations: Country[];
  regions: Region[];
  lastUsedParams: any;
  selectedService: any;
  selectedActivity: any;
  selectedAccommodation: any;
  services = '';
  activities = '';
  accommodation = '';
  inventoryRef$;
  inventorySubscription$;

  constructor(private countryService: CountryService,
              private formBuilder: FormBuilder,
              public data: DataService,
              public dialogRef: MatDialogRef<DayEditorComponent>,
              @Inject(MAT_DIALOG_DATA) public params: any) { }

  ngOnInit() {

    // get destinations
    this.destinations = this.countryService.getCountries();

    // get regions
    this.regions = this.countryService.getRegions();

    // get itinerary items
    this.inventoryRef$ = this.data.firestore.collection('inventory')

    this.inventorySubscription$ = this.inventoryRef$.valueChanges()
    .subscribe(_ => {
      if(_) {
        this.inventory = _;
      }
    })

    // get editor-components
    if (this.params.mode === 'edit') {
      this.day = this.params.day;


      // check if day-editor has accommodation and load into string
      if (this.day.accommodation !== undefined) {
        this.accommodation = this.day.accommodation.reduce((totalText, currentText) => {
          // return joined string with trailing spaces and full stops removed
          return totalText.concat(currentText.description.replace(/^[.\s]+|[.\s]+$/g, '') + '. ');
        }, '');
      }

      // check if day-editor has services and load into string
      if (this.day.services !== undefined) {
        this.services = this.day.services.reduce((totalText, currentText) => {
          // return joined string with trailing spaces and full stops removed
          return totalText.concat(currentText.service.replace(/^[.\s]+|[.\s]+$/g, '') + '. ');
        }, '');
      }


      // check if day-editor has activities and load into string
      if (this.day.activities !== undefined) {
        this.activities = this.day.activities.reduce((totalText, currentText) => {
          // return joined string with trailing spaces and full stops removed
          return totalText.concat(currentText.activity.replace(/^[.\s]+|[.\s]+$/g, '') + '. ');
        }, '');
      }
    }

    // init editor-components form
    this.dayForm = this.initDay();

    // init previously used country and region params
    this.lastUsedParams = this.params.lastUsedParams

    // check if last used params are default, then null
    // if (this.lastUsedParams.country === 0) {
    //   this.lastUsedParams.country = null
    // }

    // if (this.lastUsedParams.region === 0) {
    //   this.lastUsedParams.region = null
    // }

    // subscribe to services observable
    this.changes();

  }

  // code to load itinerary item description
  changes() {
    // subscribe to services form array
    this.dayForm.get('services')
      .valueChanges
      .subscribe((val) => {
        // reduce values services string
        this.services = val.reduce((totalText, currentText) => {
          // return joined string with trailing spaces and full stops removed
          return totalText.concat(currentText.service.replace(/^[.\s]+|[.\s]+$/g, '') + '. ');
        }, '');
      });

    // subscribe to activities form array
    this.dayForm.get('activities')
      .valueChanges
      .subscribe((val) => {
        // reduce values to activities string
        this.activities = val.reduce((totalText, currentText) => {
          // return joined string with trailing spaces and full stops removed
          return totalText.concat(currentText.activity.replace(/^[.\s]+|[.\s]+$/g, '') + '. ');
        }, '');
      });

    // subscribe to accommodation form array
    this.dayForm.get('accommodation')
      .valueChanges
      .subscribe((val) => {
        // reduce values to accommodation string
        // console.log(val)
        this.accommodation = val.reduce((totalText, currentText) => {
          // return joined string with trailing spaces and full stops removed
          return totalText.concat(currentText.description.replace(/^[.\s]+|[.\s]+$/g, '') + '. ');
        }, '');
      });
  }

  // function to init editor-components method
  initDay() {
    if (this.params.mode === 'add') {
      return this.formBuilder.group({
        // title: [''],
        days: [null, Validators.required],
        country: [this.params.lastUsedParams.country, Validators.required],
        region: [this.params.lastUsedParams.region, Validators.required],
        services: this.formBuilder.array([]),
        activities: this.formBuilder.array([]),
        accommodation: this.formBuilder.array([])
      });

    } else if (this.params.mode === 'edit') {

      const _services = [];
      const _activities = [];
      const _accommodation = [];

      // if services array is undefined assign empty array
      if (this.day.services === undefined) {
        this.day.services = [];
      } else {
        this.day.services.forEach(s => {
          _services.push(this.serviceInit(s.service));
        });
      }
      // if activities array is undefined assign empty array
      if (this.day.activities === undefined) {
        this.day.activities = [];
      } else {
        this.day.activities.forEach(a => {
          _activities.push(this.activityInit(a.activity));
        });
      }

      // if accommodation array is undefined assign empty array
      if (this.day.accommodation === undefined) {
        this.day.accommodation = [];
      } else {
        this.day.accommodation.forEach(a => {
          // console.log(a)
          _accommodation.push(this.accommodationInit(a));
        });
      }

      // console.log(`days ${this.day-editor.days} \n country ${this.day-editor.country} \n region ${this.day-editor.region}`)
      return this.formBuilder.group({
        // title: [''],
        days: [this.day.days, Validators.required],
        country: [this.day.country, Validators.required],
        region: [this.day.region, Validators.required],
        services: this.formBuilder.array(_services),
        activities: this.formBuilder.array(_activities),
        accommodation: this.formBuilder.array(_accommodation)
      });
    }
  }

  // get itinerary item
  getServices(dayForm: any, type: string) {
    if (type === 'services') {
      return dayForm.get('services').controls;
    } else if (type === 'activities') {
      return dayForm.get('activities').controls;
    } else if (type === 'accommodation') {
      return dayForm.get('accommodation').controls;
    }
  }

  // function to add itinerary items
  serviceInit(data: any) {
    return this.formBuilder.group({
      service: [data, Validators.required],
    });
  }

  activityInit(data: any) {
    return this.formBuilder.group({
      activity: [data, Validators.required],
    });
  }

  accommodationInit(data: any) {
    // console.log(data)
    return this.formBuilder.group({
      description: [data.description],
      key: [data.$key],
      inclusions: [data.inclusions],
      name: [data.name],
      longDescription: [data.longDescription],
      imageUrl: [data.imageUrl],
      region: [data.region],
      destination: [data.destination]
    });
  }

  addItineraryItem(type: string, data: any) {
    // get form control
    const control = this.dayForm.controls[type] as FormArray;

    // check the type and add to array accordingly
    switch (type) {
      case 'services':
        control.push(this.serviceInit(data.description));
        this.selectedService = null;
        break;
      case 'activities':
        control.push(this.activityInit(data.description));
        this.selectedActivity = null;
        break;
      case 'accommodation':
        control.push(this.accommodationInit(data));
        this.selectedAccommodation = null;
        break;
      default:
        console.log('nothing selected');
    }
  }

  removeItineraryItem(type: string, ii: number) {
    // get control i for editor-components index, ii for itinerary item index and type for array name
    const control = this.dayForm.controls[type] as FormArray;
    control.removeAt(ii);
  }

  // function to deal with change in select drop downs
  onSelect(countryid: any) {
    this.regions = this.countryService.getRegions().filter((region) => region.countryid === countryid);
  }

  // function to deal with region select
  onSelectRegion(regionId) {
    // console.log(regionId)
  }

  // function to validate
  validateForm(dayForm: any) {
    // variable to store true or false value
    let valid = true;

    // check if form is valid
    if (dayForm.valid) {
      // check if at least one of the itinerary item arrays has a value
      if (dayForm.get('services').controls.length > 0
        || dayForm.get('accommodation').controls.length > 0
        || dayForm.get('activities').controls.length > 0) {
        valid = false;
      }
    }

    // return validity
    return valid;
  }

  // function to close dialog
  onCloseConfirm() {
    // console.log(this.dayForm.value);
    this.dialogRef.close({dayForm: this.dayForm.value, lastUsedParams: this.params.lastUsedParams});
  }

  // function to cancel dialog
  onCloseCancel() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.inventorySubscription$.unsubscribe();
    delete this.inventoryRef$
  }
}
