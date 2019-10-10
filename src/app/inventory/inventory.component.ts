import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatBottomSheet, MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {CountryService} from '../services/country.service';
import {Router} from '@angular/router';
import {DataService} from '../services/data.service';
import {ConfirmComponent} from '../shared/confirm/confirm.component';
import {Country} from '../model/country';
import {Region} from '../model/region';
import Swal from 'sweetalert2';
import {EditorComponent} from '../shared/editor/editor.component';

@Component({
  selector: 'app-inventory',
  styleUrls: ['./inventory.component.css'],
  templateUrl: './inventory.component.html'
})
export class InventoryComponent implements OnInit, OnDestroy {
  inventory;
  error: any;
  countries: Country[] = [];
  regions: Region[] = [];
  selectedDestination: any;
  displayedColumns = [ 'Image', 'Title', 'Country', 'Region', 'Type', 'Actions'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  private ref;

  constructor(public router: Router, public data: DataService,
              public countryService: CountryService, public dialog: MatDialog,
              public bottomSheet: MatBottomSheet) {}

  ngOnInit() {
    // get countries
    this.countries = this.countryService.getCountries();

    // get regions
    this.regions = this.countryService.getRegions();

    // todo: dummy data
    // const dummydata = [
    //   this.data.sampleData.inventory['-KwZJEvnHfYeFOKnQXkA'],
    //   this.data.sampleData.inventory['-KwZJRJ8rDoNhLXxFbjw'],
    //   this.data.sampleData.inventory['-KwZJ_f6e5Rj6CRrbhII'],
    //   this.data.sampleData.inventory['-KwZK87v2uuzrVpdWIoz'],
    //   this.data.sampleData.inventory['-KwZKKmBu2cq2Z2R9Ymc'],
    //   this.data.sampleData.inventory['-KwepzM-invrDAVdp8z_'],
    //   this.data.sampleData.inventory['-KweqGt4RfNiINpm3Ffv'],
    //   this.data.sampleData.inventory['-KweqcZjCq3ubFVWdspD'],
    // ];

    // init inventory array
    this.inventory = [];

    // get inventory
    this.ref = this.data.getList('inventory')
      .snapshotChanges()
      .subscribe(snapshots => {
        snapshots.forEach(snapshot => {
          let item = {};
          item = snapshot.payload.val();
          item[`key`] = snapshot.key;
          this.inventory.push(item);
        });

        // init data source
        this.dataSource = new MatTableDataSource(this.inventory);

        // init data source
        this.dataSource.paginator = this.paginator;

        // init sort
        this.dataSource.sort = this.sort;
      });
  }

  // function to display destination names
  showDestination(id: string) {

    // return destination name
    const d = this.countries.find((item) => {

      return item.id === parseInt(id, 10);

    });

    return d.name;
  }

  // function to display region names
  showRegion(id: string) {

    // return region name
    const r = this.regions.find((item) => {

      return item.id === parseInt(id, 10);

    });

    return r.name;
  }

  // function to open confirm delete dialog
  openDelete(item) {

    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '480px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        // if result is true
        if (result) {
          this.deleteInventory(item);
        }
      }
    }).unsubscribe();
  }

  // function to delete item
  deleteInventory(item) {

    this.data.deleteItem(item.$key, 'inventory')
      .then(() => {

        console.log('inventory item deleted');

        // check if inventory item has an image
        if (item.image !== undefined && item.image !== 'undefined') {

          // delete image from firebase storage
          try {
            this.data.deleteItemWithImage(item.image)
              .subscribe((res) => {
                Swal.fire('Success', 'Inventory item deleted: ' + JSON.stringify(res), 'success');
                console.log(res);
              });
          } catch (e) {
            Swal.fire('Failed', e.message, 'error');
            console.log(e);
          }

            // .then(() => {
            //
            //   console.log('inventory image deleted');
            // })
            // .catch((error) => {
            //
            //   console.log('image delete error: ' + error.message);
            // });
        }
      })
      .catch((error) => {

        this.error = error.message;
      });
  }

  // function to add new inventory item
  addNew() {
    this.bottomSheet.open(EditorComponent, {
      data: {
        item: null,
        new: true,
        type: 'inventory'
      }
    });
  }

// function to edit inventory item
  editInventoryItem(inventoryItem) {
    this.bottomSheet.open(EditorComponent, {
      data: {
        item: inventoryItem,
        new: false,
        type: 'inventory'
      }
    });
  }

  ngOnDestroy(): void {
    this.ref.unsubscribe();
  }
}
