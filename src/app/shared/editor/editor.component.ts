import {Component, Inject, OnInit} from '@angular/core';
import {Itinerary} from '../../model/itinerary';
import {DataService} from '../../services/data.service';
import {FormArray, FormBuilder, FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
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
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {MatDialogConfig} from '@angular/material';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {generalInclusions} from '../../model/generalInclusions';

// interface for country codes
export interface CountryCodes {
  code: string;
  name: string ;
}

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
  itinerary: Itinerary;
  agent: Agent;
  client: Client;
  numbers: any;
  agents = [];
  clients = [];
  error: any;
  user: any;
  invoiceDetails: any;
  countries = countries;
  inventoryItem: InventoryItem;
  mediaItem: MediaItem;
  destinations: Country[];
  regions: Region[];
  types = inventoryTypes;
  oldImage: any;
  filteredCountries: Observable<CountryCodes>;
  private filteredClients: Observable<any[]>;
  generalInclusions = generalInclusions;

  constructor(@Inject(MAT_DIALOG_DATA) public args: any,
              private formBuilder: FormBuilder,
              public data: DataService,
              public router: Router,
              public countryService: CountryService,
              public bottomSheetRef: MatDialogRef<EditorComponent>) {}



              // getter to return filtered country codes
  private _filterCountries(value): CountryCodes[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter(country => country.name.toLowerCase().indexOf(filterValue) === 0);
  }

  // getter to return filtered country codes
  private _filterClients(value): CountryCodes[] {
    const filterValue = value.toLowerCase();
    return this.clients.filter(client => `${client.firstname} ${client.lastname}`.toLowerCase().indexOf(filterValue) === 0);
  }

  ngOnInit() {
    // get logged in user
    this.user = this.data.user;

    // check type
    switch (this.args.type) {
        case 'itinerary':
          this.initNewItinerary();
          break;
        case 'clients':
          this.client = this.args.item;
          this.initNewClient();


          break;
        case 'inventory':
          this.inventoryItem = this.args.item;
          this.destinations = this.countryService.getCountries();
          this.initNewInventory();
          break;
        case 'agents':
          this.agent = this.args.item;
          this.initNewAgent();
          break;
      case 'media':
          this.mediaItem = this.args.item ? this.args.item : new MediaItem();
          break;
        default:
          return;
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

                          // init filtered clients  and subscribe to client form control on itinerary form
                          this.filteredClients = this.itineraryForm.controls.client
                          .valueChanges
                          .pipe(
                            startWith(''),
                            map(client => client ? this._filterClients(client) : this.clients.slice())
                          );

    // get company invoice details
    this.data.af.object(`companies/${this.data.company}`)
      .valueChanges()
      .subscribe((res) => {
        // this.data.list('company/True Africa')
        this.invoiceDetails = {prefix: res[`prefix`], invoice_number: res[`invoice_number`]};
      });

    // get agents list
    this.data.af.list('users')
      .snapshotChanges()
      .subscribe((_) => {
        _.forEach(snapshot => {
          const agent = snapshot.payload.val();
          agent[`key`] = snapshot.key;
          this.agents.push(agent);
        });
      });

    // get client list
    this.data.af.list(`clients/${this.data.company}/`)
      .snapshotChanges()
      .subscribe(_ => {
        _.forEach(snapshot => {
          const client = snapshot.payload.val();
          client[`key`] = snapshot.key;
          this.clients.push(client);
        });
        
      })


    // make numbers
    this.numbers = Array.from(Array(20).keys());
  }

  // initialize new client form
  initNewClient() {
    this.clientForm = this.args.new ? this.formBuilder.group({
      email: [null, Validators.required],
      firstname: [null, Validators.required],
      lastname: [null, Validators.required],
      nationality: [null, Validators.required],
      phone: [null, Validators.required]
    }) : this.formBuilder.group(this.client);

    // init filtered countries and subscribe to value changes on nationality control
    this.filteredCountries = this.clientForm.controls.nationality
      .valueChanges
      .pipe(
        startWith(''),
        map(country => country ? this._filterCountries(country) : this.countries.slice())
      );
  }

  // initialize new agent form
  initNewAgent() {
    this.agentForm = this.args.new ? this.formBuilder.group({
      email: [null, Validators.required],
      firstname: [null, Validators.required],
      lastname: [null, Validators.required],
      password: [null, Validators.required],
      role: [null, Validators.required],
    }) : this.formBuilder.group(this.agent);
  }

  // initialize new inventory form
  initNewInventory() {
    this.inventoryForm = this.args.new ? this.formBuilder.group({
      description: [null, Validators.required],
      destination: [null, Validators.required],
      image: [null, Validators.required],
      inclusions: [null, Validators.required],
      long_description: [null, Validators.required],
      name: [null, Validators.required],
      region: [null, Validators.required],
      type: [null, Validators.required],
    }) : this.formBuilder.group(this.inventoryItem);
  }


  addTag(tag: string) {
    this.mediaItem.tags.push(tag);
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
    if (this.itineraryForm.valid) {

      // convert dates to date strings
      this.itineraryForm.value.startdate = this.itineraryForm.value.startdate.toDateString();
      this.itineraryForm.value.enddate = this.itineraryForm.value.enddate.toDateString();

      // add status field to formData
      this.itineraryForm.value.status = 'Provisional';

      this.itineraryForm.value.generalInclusions = generalInclusions;

      // increment invoice number
      this.invoiceDetails.invoice_number += 1;

      // add invoice number to itinerary
      this.itineraryForm.value.invoice_number = `${this.invoiceDetails.prefix}-${this.invoiceDetails.invoice_number}`;

      // push to firebase
      this.data.saveItem(`itineraries/${this.data.company}`, this.itineraryForm.value)
        .then((res) => {
          // update invoice number in firebase
          this.data.updateItem(this.data.company, 'companies', this.invoiceDetails);

          // go to itinerary editor with new itinerary
          this.router.navigate(['/itinerary-editor', res.key])
            .then(() => {
              Swal.fire('Success!', 'New itinerary successfully added', 'success')
                .then(_ => {
                  this.closeDialog();
                });
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
      Swal.fire('Media', 'File selected!', 'info');

    } else {
      alert('Image size must be less than 1.5MB');
      this.mediaItem.image = null;
      this.error = 'Please upload an image smaller than 1.5MB';
    }
  }

  // function to save media to firebase
  addMedia() {
    // check if new media item
    if (this.args.new) {
      this.data.saveItemWithImage('media', { caption: this.mediaItem.caption, title: this.mediaItem.title }, this.mediaItem.image, 'media')
        .subscribe((res) => {
          console.log(res);
          Swal.fire('Success', 'New media item successfully added', 'success');
        });

      } else {

          // TODO: delete old image
          this.data.deleteItemWithImage(this.oldImage)
          .then((res) => {
            // update with image
            this.data.updateItemWithImage(this.mediaItem[`key`], 'media', this.mediaItem, this.mediaItem.image, 'media');

            // console.log(res);
            Swal.fire('Success', 'Existing media item successfully updated', 'success');
          })
            .catch((err) => {
              console.log(err);
              Swal.fire('Failed!', `An error has occurred: ${err.message}`, 'error');
              this.error = err;
            });
          }
        // close form
    this.closeDialog();
  }

  // function to close dialog
  closeDialog() {
    this.bottomSheetRef.close();
  }


  // function to save single item to list
  saveItem(data) {
    let databasePath = this.args.type === 'agents' ? 'users/' : `${this.args.type}/`;
    let itemId;
    // check if client

    switch (this.args.type) {
      case 'itineraries':
        // itemId = this.itinerary[`key`]
        break;
      case 'clients':
        itemId = this.client ? this.client[`key`] : null;
        data.agent = this.user[`key`];
        databasePath += `${this.data.company}/`;
        break;
      case 'inventory':
        itemId = this.inventoryItem ? this.inventoryItem[`key`] : null;
        break;
      case 'agents':
        itemId = this.agent ? this.agent[`key`] : null;
        break;
      case 'media':
        itemId = this.mediaItem ? this.mediaItem[`key`] : null;
        break;
    }

    // remove key
    delete data[`key`];

    // check if new item
    if (this.args.new) {
      // write to database
      this.data.saveItem(databasePath, data)
      .then(_ => {
        // Swal
        Swal.fire('Success', `New ${this.args.type.slice(0, this.args.type.length - 1)} successfully added`, 'success');

        // close dialog
        this.closeDialog();
      })
      .catch((err) => {
        console.log(err);

        // Swal
        Swal.fire('Failed!', `An error has occurred: ${err.message}`, 'error');

        // assign error to variable
        this.error = err;
      });
    } else {
      // push to firebase
      this.data.af.object( `${databasePath}${itemId}`)
        .update(data)
        .then(_ => {
          // Swal
          Swal.fire('Success', `Existing ${this.args.type.slice(0, this.args.type.length - 1)} successfully updated`, 'success');

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

    this.closeDialog();
  }

  // function to update single item
}
