import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {Itinerary} from '../../model/itinerary';
import {DataService} from '../../services/data.service';
import {FormArray, FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';
import {countries} from '../../model/countries';
import {Country} from '../../model/country';
import {Region} from '../../model/region';
import {inventoryTypes} from '../../model/inventory-types';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {generalInclusions} from '../../model/generalInclusions';
import {Passenger} from '../../model/passenger';
import {firestore} from 'firebase/app';

// interface for country codes
export interface CountryCodes {
  code: string;
  name: string ;
}

@Component({
  selector: 'app-editor',
  styleUrls: ['./editor.component.scss'],
  templateUrl: './editor.component.html',
  encapsulation: ViewEncapsulation.None
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
  inventoryItem;
  mediaItem: any;
  destinations = [];
  regions: Region[];
  types = inventoryTypes;
  oldImage: any;
  filteredCountries: Observable<CountryCodes>;
  private filteredClients: Observable<any[]>;
  generalInclusions = generalInclusions;
  newImage: any;
  adults: any;
  children: any;
  country;
  countryForm: any;

  constructor(@Inject(MAT_DIALOG_DATA) public args: any,
              private formBuilder: FormBuilder,
              public data: DataService,
              public router: Router,
              public bottomSheetRef: MatDialogRef<EditorComponent>) {}



              // getter to return filtered country codes
  private _filterCountries(value): any[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter(country => country.name.toLowerCase().indexOf(filterValue) === 0);
  }

  // getter to return filtered country codes
  // private _filterClients(value): any[] {
  //   const filterValue = value.toLowerCase();
  //   return this.clients.filter(client => `${client.firstName} ${client.lastName}`.toLowerCase().indexOf(filterValue) === 0);
  // }

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
          this.client = this.args.item ? this.args.item : {};
          this.initNewClient();
          break;
        case 'inventory':
          this.inventoryItem = this.args.item ? this.args.item : {};

          this.initNewInventory();
          break;
        case 'agents':
          this.agent = this.args.item ? this.args.item : {};
          this.initNewAgent();
          break;
      case 'media':
          this.mediaItem = this.args.item ? this.args.item : {};
          break;
      case 'countries':
        this.country = this.args.item ? this.args.item : {};
        this.initNewCountry();
        break;
        default:
          return;
      }
  }

  // init new country form
  initNewCountry() {
    // init country form
    this.countryForm = this.formBuilder.group({
      id: [null],
      name: [null, Validators.required],
      regions: this.formBuilder.array([]),
      phoneNumbers: this.formBuilder.array([]),
      flag: [null],
      code: [null]
    });

    // check if new
    if (!this.args.new) {
      // load existing country

      // populate  regions array
      this.country.regions.forEach(region => {
        this.countryForm.controls.regions.push(this.patchValue(region, 'regions'));
      });

      // populate phone numbers array
      this.country.phoneNumbers.forEach(phoneNumber => {
        this.countryForm.controls.phoneNumbers.push(this.patchValue(phoneNumber, 'phoneNumbers'));
      });

      // populate other form controls
      this.countryForm.patchValue({
        id: this.country.id,
        name: this.country.name,
        flag: this.country.flag,
        code: this.country.code
      });
    }
  }

  // patch values to form array control
  patchValue(item, type) {
    if (type === 'regions') {
      return this.formBuilder.group({
        name: item.name,
      });
    } else {
      return this.formBuilder.group({
        number: item.number,
      });
    }

  }

  addRegion() {
    const regionArray = this.countryForm.get('regions');
  }

  // initialize new itinerary form
  initNewItinerary() {

    this.itineraryForm = this.formBuilder.group({
      adults: this.formBuilder.array([]),
      agent: [null, Validators.required],
      children: this.formBuilder.array([]),
      client: [null, Validators.required],
      endDate: [null, Validators.required],
      startDate: [null, Validators.required],
      title: [null, Validators.required]
    });

                          // init filtered clients  and subscribe to client form control on itinerary form
    // this.filteredClients = this.itineraryForm.controls.client
    //   .valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(client => client ? this._filterClients(client) : this.clients.slice()));

    // get company invoice details
    this.data.firestore.doc(`companies/${this.data.company.key}`)
      .valueChanges()
      .subscribe((res) => {
        // this.data.list('company/True Africa')
        this.invoiceDetails = {prefix: res[`prefix`], invoiceNumber: res[`invoiceNumber`]};
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
    const companyRef$ = this.data.firestore.doc(`companies/${this.data.company.key}`).ref;
    this.data.firestore.collection(`clients`, ref => ref.where('company', '==', companyRef$).orderBy('firstName'))
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
      email: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
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
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      password: [null, Validators.required],
      role: [null, Validators.required],
    }) : this.formBuilder.group(this.agent);
  }

  // initialize new inventory form
  initNewInventory() {
    // init inventory form
    this.inventoryForm = this.args.new ? this.formBuilder.group({
      description: [null, Validators.required],
      destination: [null, Validators.required],
      // image: [null, Validators.required],
      inclusions: [null],
      longDescription: [null],
      name: [null, Validators.required],
      region: [null, Validators.required],
      type: [null, Validators.required],
    }) : this.formBuilder.group(this.inventoryItem);

    // get countries array
    this.data.firestore.collection('countries')
      .snapshotChanges()
      .subscribe(_ => {
        this.destinations = [];
        _.forEach(__ => {
          const country = __.payload.doc.data();
          country[`key`] = __.payload.doc.id;
          this.destinations.push(country);
        });

        // if editing
        if (!this.args.new) {
          // set regions
          this.onSelect({ value: this.inventoryItem.destination.id});

          // set destination to country firestore key
          this.inventoryForm.controls.destination.patchValue(this.inventoryItem.destination.id);
        }
      });
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
      this.itineraryForm.value.startDate = this.itineraryForm.value.startDate.toDateString();
      this.itineraryForm.value.endDate = this.itineraryForm.value.endDate.toDateString();

      // add status field to formData
      this.itineraryForm.value.status = 'Provisional';

      this.itineraryForm.value.generalInclusions = generalInclusions;

      // increment invoice number
      this.invoiceDetails.invoiceNumber += 1;

      // add invoice number to itinerary
      this.itineraryForm.value.invoiceNumber = this.invoiceDetails.invoiceNumber;

      // add company ref
      this.itineraryForm.value.company = this.data.firestore.doc(`companies/${this.data.company.key}`).ref;

      // add agent ref
      this.itineraryForm.value.agent = this.data.firestore.doc(`users/${this.itineraryForm.value.agent}`).ref;

      // add client ref
      this.itineraryForm.value.client = this.data.firestore.doc(`clients/${this.itineraryForm.value.client}`).ref;

      this.itineraryForm.value.created = firestore.Timestamp.now();

      // push to firebase
      this.data.firestore.collection(`itineraries`)
        .add(this.itineraryForm.value)
        .then((res) => {
          // update invoice number in firebase
          this.data.firestore.doc(`companies/${this.data.company.key}`)
            .update({
              invoiceNumber: this.invoiceDetails.invoiceNumber
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
  // onSelect(event) {
  //   this.regions = this.countryService.getRegions().filter((region) => region.countryid === event.value);
  //   this.inventoryForm.get('region').setValue(null);
  //   // this.inventoryForm.controls.setValue('region', null);
  // }

  // function to delete image
  deleteImage() {

    // assign old image url to seperate variable
    this.oldImage = this.inventoryItem.image;

    // delete image from inventory item
    delete this.inventoryItem.image;
    delete this.inventoryItem.imageUrl;

  }


  // function to add inventory item
  addInventory(inventory) {
    // add destination ref
    inventory.destination = this.data.firestore.doc(`countries/${inventory.destination}`).ref;

    // check if adding new inventory
    if (this.args.new) {
      // check if inventory type is service or activity
      if (inventory.type != 'Accommodation') {
        // call normal firebase save function
        this.data.saveFirebaseObject('inventory', inventory, 'inventory');
      } else {
        //  save image & get download url
        // show loading Swal
        Swal.fire('Inventory editor', 'updating image', 'info');
        this.data.saveImage(this.newImage)
          .then(url => {
            if  (url) {
              // close Swal
              Swal.close();
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
        this.data.updateFirebaseObject(`inventory/${this.inventoryItem[`key`]}`, dataToUpdate, 'inventory', true);
      } else {

        // add accommodation fields to update data
        dataToUpdate[`longDescription`] = inventory.longDescription;
        dataToUpdate[`inclusions`] = inventory.inclusions;

        // first update image
        if (this.newImage) {
          dataToUpdate[`image`] = 'inventory-items/' + this.newImage.name;
          // show loading Swal
          Swal.fire('Inventory editor', 'updating image', 'info');
          this.data.saveImage(this.newImage)
            .then(uploadResult => {
              uploadResult.subscribe(url => {
                // close Swal
                Swal.close();
                // get file url
                dataToUpdate[`imageUrl`] = url;

                // write to firebase
                this.data.updateFirebaseObject(`inventory/${this.inventoryItem[`key`]}`, dataToUpdate, 'inventory', true);
              });
            })
            .catch(err => {
              console.log(err);
              Swal.fire('inventory editor', err.message, 'error');
            });
          //
        } else {
         this.data.updateFirebaseObject(`inventory/${this.inventoryItem[`key`]}`, dataToUpdate, 'inventory', true);
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

  // todo: media crud
  // function to save media to firebase
  addMedia() {
    // check if new media item
    if (this.args.new) {
      this.data.saveItemWithImage('media', { caption: this.mediaItem.caption, title: this.mediaItem.title }, this.mediaItem.image, 'media');

      } else {
      // update item with image
      this.data.updateItemWithImage(this.mediaItem[`key`], 'media', this.mediaItem, this.mediaItem.image, 'media');

          // TODO: delete old image
          // this.data.deleteItemWithImage(this.oldImage)
          // .then((res) => {
          //   // update with image
          //
          //
          //   // console.log(res);
          //   // Swal.fire('Success', 'Existing media item successfully updated', 'success');
          // })
          //   .catch((err) => {
          //     console.log(err);
          //     Swal.fire('Failed!', `An error has occurred: ${err.message}`, 'error');
          //     this.error = err;
          //   });
          }
        // close form
    this.closeDialog();
  }

    // function to delete image for media
    deleteImageForMedia() {
      // assign old image url to seperate variable
      this.oldImage = this.mediaItem.image;

      // delete image from inventory item
      delete this.mediaItem.image;
      delete this.mediaItem.imageUrl;
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
       this.data.updateFirebaseObject(`clients/${this.client.key}`, dataToUpdate, 'client', true);
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
      this.data.updateFirebaseObject(`users/${this.agent.key}`, dataToUpdate, 'agent', true);
    } else {
      // add new agent
      this.data.saveFirebaseObject('users', agent, 'agent');
    }
    // close dialog
    this.closeDialog();
  }

  // convenience getters for easy access to form fields
  get f() {
    return this.itineraryForm.controls;
  }

  get adultsArray() {
    return this.f.adults as FormArray;
  }

  get childrenArray() {
    return this.f.children as FormArray;
  }

  // adds new form control to a FormArray
  addFormControl() {
    // @ts-ignore
    return this.formBuilder.group(new Passenger('', '', 0, false));
  }

  // adds form control to array
  addFormControlForCountry(arrayName) {
    if (arrayName === 'regions') {
      this.countryForm.controls[arrayName].push(this.formBuilder.group({name: null}));
    } else {
      this.countryForm.controls[arrayName].push(this.formBuilder.group({number: null}));
    }
  }

  // removes form control from array
  removeFormControlForCountry(arrayName, index) {
    this.countryForm.controls[arrayName].removeAt(index);
  }

  // function to handle number of adults change change
  onChangePassengers(event, adult) {
    // get the number of specified customers from event
    const passengerCount = event.value || 0;

    const passengers = adult ? this.adultsArray : this.childrenArray;

    if (passengers.length < passengerCount) {
      for (let count = passengers.length; count < passengerCount; count++) {
        passengers.push(this.addFormControl());
      }
    } else {
      for (let count = passengers.length; count >= passengerCount; count--) {
        passengers.removeAt(count);
      }
    }
  }

  // function to add new country or edit existing country
  addCountry(country) {
    // if NEW
    if (this.args.new) {
      // write to firebase
      this.data.saveFirebaseObject('countries', country, 'country');
    } else {
      // update firebase object
      this.data.updateFirebaseObject(`countries/${this.country.key}`, country, 'country', true);
    }

    // close editor
    this.closeDialog();

  }

  onSelect($event) {
    // clear regions array
    this.regions = [];

    // get destination
    const destination = this.destinations.find(country => country[`key`] === $event.value);

    // set regions array
    this.regions = destination[`regions`];
  }
}
