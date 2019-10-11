import {Component, Inject, OnInit} from '@angular/core';
import {Itinerary} from '../../model/itinerary';
import {DataService} from '../../services/data.service';
import {FormArray, FormBuilder, FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import Swal from 'sweetalert2';
import {countries} from '../../model/countries';
import {Agent} from '../../model/agent';
import {Client} from '../../model/client';
import {InventoryItem} from '../../model/inventoryItem';
import {Country} from '../../model/country';
import {Region} from '../../model/region';
import {CountryService} from '../../services/country.service';
import {inventoryTypes} from '../../model/inventory-types';
import {MediaItem} from '../../model/mediaItem';

@Component({
  selector: 'app-editor',
  styleUrls: ['./editor.component.css'],
  templateUrl: './editor.component.html'
})

export class EditorComponent implements OnInit {
  itineraryForm: any;
  agentForm: any;
  clientForm: any;
  inventoryForm: any;
  mediaForm: any;
  itinerary: Itinerary;
  agent: Agent;
  client: Client;
  numbers: any;
  agents: any;
  clients: any;
  error: any;
  user: any;
  invoiceDetails: any;
  countries = countries;
  inventoryItem: InventoryItem;
  mediaItem: MediaItem;
  destinations: Country[];
  regions: Region[];
  types = inventoryTypes;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public args: any,
              private formBuilder: FormBuilder,
              public data: DataService,
              public router: Router,
              public countryService: CountryService,
              public bottomSheetRef: MatBottomSheetRef<EditorComponent>) {
  }

  ngOnInit() {
    // get logged in user
    this.user = this.data.user;

    // check if creating new item
    if (this.args.new) {
      switch (this.args.type) {
        case 'itinerary':
          console.log('itinerary');
          this.initNewItinerary();
          break;
        case 'clients':
          console.log('clients');
          this.initNewClient();
          break;
        case 'inventory':
          console.log('inventory');

          // init inventory item
          this.inventoryItem = new InventoryItem();

          // get destinations from country service
          this.destinations = this.countryService.getCountries();

          this.initNewInventory();
          break;
        case 'agents':
          console.log('agents');
          this.initNewAgent();
          break;
        case 'media':
          console.log('media');

          // init media item
          this.mediaItem = new MediaItem();

          this.initNewMediaItem();
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
    this.clientForm = this.formBuilder.group({
      email: [null, Validators.required],
      firstName: [null, Validators.required],
    lastName: [null, Validators.required],
      nationality: [null, Validators.required],
    phone: [null, Validators.required]
    });
  }

  // initialize new agent form
  initNewAgent() {
    this.agentForm = this.formBuilder.group({
      email: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      password: [null, Validators.required],
      role: [null, Validators.required],
    });
  }

  // initialize new inventory form
  initNewInventory() {
    this.inventoryForm = this.formBuilder.group({
      description: [null, Validators.required],
      destination: [null, Validators.required],
      image: [null, Validators.required],
      inclusions: [null, Validators.required],
      longDescription: [null, Validators.required],
      name: [null, Validators.required],
      region: [null, Validators.required],
      type: [null, Validators.required],
    });
  }

  // initialize new media form
  initNewMediaItem() {
    // this.mediaItem
    this.mediaForm = this.formBuilder.group({
      caption: [null, Validators.required],
      // image: [null, Validators.required],
      title: [null, Validators.required],
      // tags: [FormArray]
    });
  }

  addTag(tag: string){
    const mediaform = this.mediaForm.get('tags') as FormArray;
    mediaform.push(new FormControl());
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

  // function to add new itinerary
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

          this.bottomSheetRef.dismiss();

          // go to itinerary editor with new itinerary
          this.router.navigate(['itinerary-editor', { queryParams: {itineraryData: itinerary }} ])
            .then(() => {
              Swal.fire('Success!', 'New itinerary successfully added', 'success');
              }
            );

        })
        .catch((error) => {
          console.log(error);

          Swal.fire('Failed!', `An error has occurred: ${error.message}`, 'error');

          this.error = error;
        });

    }
  }

  // function to add new client
  addClient(clientForm) {

    // add agent key to client
    clientForm.value.agent = this.user.uid;

    // check if form data is valid
    if (clientForm.valid) {
      // push to firebase
      this.data.saveItem( `clients/${this.data.currentCompany}/`, clientForm.value)
        .then(() => {
          // swal
          Swal.fire('Success', 'New client successfully added', 'success');

          // close dialog
          this.closeDialog();

        })
        .catch((error) => {
          console.log(error);

          Swal.fire('Failed!', `An error has occurred: ${error.message}`, 'error');

          // assign error to variable
          this.error = error;
        });
    }
  }

  // function to add new agent
  addAgent(agentForm) {

    // check if form data is valid
    if (agentForm.valid) {
      // write user to firebase
      this.data.saveUser(agentForm.value)
        .then(() => {
          // swal
          Swal.fire('Success', 'New agent successfully added', 'success');

          // close dialog
          this.closeDialog();

        })
        .catch((error) => {
          this.error = error;

          Swal.fire('Failed!', `An error has occurred: ${error.message}`, 'error');

          console.log(error);
        });
    }
  }

  // function to detect when file is selected
  fileSelected(file) {
    if (file.size <= 1048576) {
      this.inventoryItem.image = file;

      console.log(file);
      alert('file selected');
    } else {
      alert('Image size must be less than 1MB');
      this.inventoryItem.image = null;
      this.error = 'Please upload an image smaller than 1MB';
    }

  }

  // function to deal with change in select drop downs
  onSelect(event) {
    this.regions = this.countryService.getRegions().filter((region) => region.countryid === event.value);
    this.inventoryForm.get('region').setValue(null);
    // this.inventoryForm.controls.setValue('region', null);
  }

  // function to add inventory item
  addInventory(inventoryForm) {
    // check if form data is valid
    if (inventoryForm.valid) {
      // check if image is loaded
      if (this.inventoryItem.image === undefined) {

        // call normal firebase save function
        this.data.saveItem('inventory', inventoryForm.value)
          .then(() => {
            // swal
            Swal.fire('Success', 'New inventory item successfully added', 'success');

            // close dialog
            this.closeDialog();

          })
          .catch((error) => {
            console.log(error);

            Swal.fire('Failed!', `An error has occurred: ${error.message}`, 'error');

            // show error text
            this.error = error;
          });

      } else {
        // call firebase save with image function
        this.data.saveItemWithImage('inventory-images', inventoryForm.value, this.inventoryItem.image, 'inventory')
          .subscribe((res) => {
            console.log(res);
            // swal
            Swal.fire('Success', 'New inventory item successfully added', 'success');
          });
      }
    }
  }


  // function to detect when file is selected for media item
  fileSelectedForMedia(file) {
    if (file.size <= (1648576) ) {
      this.mediaItem.image = file;

      console.log(file);
      alert('file selected');
    } else {
      alert('Image size must be less than 1.5MB');
      this.mediaItem.image = null;
      this.error = 'Please upload an image smaller than 1.5MB';
    }
  }

  // function to save media to firebase
  addMedia(mediaItemForm) {

    if (mediaItemForm.valid && this.mediaItem.image !== null) {
      this.data.saveItemWithImage('media', mediaItemForm.value, this.mediaItem.image, 'media')
        .subscribe((res) => {
          console.log(res);
          Swal.fire('Success', 'New media item successfully added', 'success');
        });
    }
  }

  // function to close dialog
  closeDialog() {
    this.bottomSheetRef.dismiss();
  }
}
