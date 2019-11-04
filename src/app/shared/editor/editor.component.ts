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
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {generalInclusions} from '../../model/generalInclusions';
import {firestore} from 'firebase';

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
  agent: any;
  client: any;
  numbers: any;
  agents = [];
  clients = [];
  error: any;
  user: any;
  invoiceDetails: any;
  countries = countries;
  inventoryItem: any;
  mediaItem: MediaItem;
  destinations: Country[];
  regions: Region[];
  types = inventoryTypes;
  oldImage: any;
  filteredCountries: Observable<CountryCodes>;
  private filteredClients: Observable<any[]>;
  generalInclusions = generalInclusions;
  newImage: any;

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
    return this.clients.filter(client => `${client.firstName} ${client.lastName}`.toLowerCase().indexOf(filterValue) === 0);
  }

  ngOnInit() {
    // get logged in user
    this.user = this.data.user;

    console.log(this.args);

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
        map(client => client ? this._filterClients(client) : this.clients.slice()));

    // get company invoice details
    this.data.firestore.doc(`companies/${this.data.company.key}`)
      .valueChanges()
      .subscribe((res) => {
        // this.data.list('company/True Africa')
        this.invoiceDetails = {prefix: res[`prefix`], invoice_number: res[`invoice_number`]};
      });

    // get agents list
    this.data.firestore.collection('users')
      .snapshotChanges()
      .subscribe((_) => {
        _.forEach(snapshot => {
          const agent = snapshot.payload.doc.data();
          agent[`key`] = snapshot.payload.doc.id;
          this.agents.push(agent);
        });
      });

    // get client list
    this.data.firestore.collection(`clients`, ref => ref.where('company', '==', this.data.company.key))
      .snapshotChanges()
      .subscribe(_ => {
        _.forEach(snapshot => {
          const client = snapshot.payload.doc.data();
          client[`key`] = snapshot.payload.doc.id;
          this.clients.push(client);
        });

      });


    // make numbers
    this.numbers = Array.from(Array(20).keys());
  }

  // initialize new client form
  initNewClient() {
    this.clientForm = this.args.new ? this.formBuilder.group({
      email: ['e@mail.com', Validators.required],
      firstName: ['test', Validators.required],
      lastName: ['data', Validators.required],
      nationality: ['Zambian', Validators.required],
      phone: ['00000', Validators.required]
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
      email: ['test@null.com', Validators.required],
      firstName: ['yest', Validators.required],
      lastName: ['nuts', Validators.required],
      password: ['wolf@1988', Validators.required],
      role: ['agent', Validators.required],
    }) : this.formBuilder.group(this.agent);
  }

  // initialize new inventory form
  initNewInventory() {
    this.inventoryForm = this.args.new ? this.formBuilder.group({
      description: ['test', Validators.required],
      destination: [1, Validators.required],
      // image: [null, Validators.required],
      inclusions: ['test', Validators.required],
      longDescription: ['test', Validators.required],
      name: ['test', Validators.required],
      region: [11, Validators.required],
      type: ['Accommodation', Validators.required],
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
      this.data.firestore.collection(`itineraries`)
        .add(this.itineraryForm.value)
        .then((res) => {
          // update invoice number in firebase
          this.data.firestore.doc(`companies/${this.data.company.key}`)
            .update({
              invoiceNumber: this.invoiceDetails.invoice_number
            })
            .then(_ => {
              console.log('invoice number updated');
            })
            .catch(err => {
              console.log('an error has occured');
            });

          // go to itinerary editor with new itinerary
          this.router.navigate(['/itinerary-editor', res.id])
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
      this.newImage = file;
      console.log(file);
      Swal.fire('Inventory editor', 'file selected', 'success');
      this.error = null;
    } else {
      Swal.fire('Inventory editor', 'Image size must be less than 1MB', 'error');
      this.newImage = null;
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
  addInventory(inventory) {
    // check if adding new inventory
    if (this.args.new) {
      // check if inventory type is service or activity
      if (inventory.type != 'Accommodation') {
        // call normal firebase save function
        this.data.saveFirebaseObject('inventory', inventory, 'inventory');
      } else {
        //  save image & get download url
        this.data.saveImage(this.newImage)
          .then(url => {
            if  (url) {
              // add image Url and download url to object
              url.subscribe(uRl => {
                inventory[`imageUrl`] = uRl;
                inventory[`image`] = `inventory-images/${this.newImage.name}`;
                // write data to firebase
                this.data.saveFirebaseObject('inventory', inventory, 'inventory accommodation');
              });
            }
          })
          .catch(err => {
            console.log(err);
            Swal.fire('inventory editor', err.message, 'error');
          });
      }
    } else {

      const dataToUpdate = {
        description: inventory.description,
        destination: inventory.destination,
        name: inventory.name,
        region: inventory.region,
        type: inventory.type
      };

      // check if type is service or activity
      if (this.inventoryItem.type != 'Accommodation') {
        // update existing object
        this.data.updateFirebaseObject(`inventory/${this.inventoryItem[`key`]}`, dataToUpdate, 'inventory');
      } else {

        // add accommodation fields to update data
        dataToUpdate[`longDescription`] = inventory.longDescription;
        dataToUpdate[`inclusions`] = inventory.inclusions;
        dataToUpdate[`image`] = 'inventory-items/' + this.newImage.name;

        // first update image
        if (this.newImage) {
          this.data.saveImage(this.newImage)
            .then(uploadResult => {
              uploadResult.subscribe(url => {
                // get file url
                dataToUpdate[`imageUrl`] = url;

                // write to firebase
                this.data.updateFirebaseObject(`inventory/${this.inventoryItem[`key`]}`, dataToUpdate, 'inventory');
              });
            })
            .catch(err => {
              console.log(err);
              Swal.fire('inventory editor', err.message, 'error');
            });
          //
        } else {
         this.data.updateFirebaseObject(`inventory/${this.inventoryItem[`key`]}`, dataToUpdate, 'inventory');
        }
      }
    }

    // close dialog
    this.closeDialog();
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

  addClient(client) {
    // check if adding new client
    if (this.args.new) {
      // add company to client
      client[`company`]  = this.data.firestore.doc(`companies/${this.data.company.key}`).ref;

      // add agent to client
      client[`agent`] = this.data.firestore.doc(`users/${this.data.user.key}`).ref;

      // write to firebase
      this.data.saveFirebaseObject('clients', client, 'client');
    } else {
      // create update object
       const dataToUpdate = {
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          nationality: client.nationality,
          phone: client.phone
        };

       // write to firebase
       this.data.updateFirebaseObject(`clients/${this.client.key}`, dataToUpdate, 'client');
    }

    // close dialog
    this.closeDialog();
  }

  // function to update single item
  addAgent(agent: any) {
    // check if adding new
    if (!this.args.new) {
      // create update object
      const dataToUpdate = {
          email: agent.email,
          firstName: agent.firstName,
          lastName: agent.lastName,
          role: agent.role,
        };

      // update firebase object
      this.data.updateFirebaseObject(`users/${this.agent.key}`, dataToUpdate, 'agent');
    } else {
      // add new agent
      this.data.saveFirebaseObject('users', agent, 'agent');
    }
    // close dialog
    this.closeDialog();
  }
}
