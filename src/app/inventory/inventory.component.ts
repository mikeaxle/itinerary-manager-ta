import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_SCROLL_STRATEGY, MatBottomSheet, MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
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
              public countryService: CountryService, public dialog: MatDialog) {}

  ngOnInit() {
    // get countries
    this.countries = this.countryService.getCountries();

    // get regions
    this.regions = this.countryService.getRegions();

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
            this.data.deleteItemWithImage(item.image)
              .then((res) => {
                Swal.fire('Success', 'Inventory item deleted: ' + JSON.stringify(res), 'success');
                console.log(res);
              })
              .catch((err) => {
                Swal.fire('Failed', err.message, 'error');
                console.log(err);
              });
        }
      })
      .catch((error) => {

        this.error = error.message;
      });
  }

  // function to add new inventory item
  addNew() {
    this.dialog.open(EditorComponent, {
      data: {
        item: null,
        new: true,
        type: 'inventory'
      }
    });
  }

// function to edit inventory item
  editInventoryItem(inventoryItem) {
    // todo: fix region control when editing inventory item
    this.dialog.open(EditorComponent, {
      autoFocus: false,
      data: {
        item: inventoryItem,
        new: false,
        type: 'inventory'
      },
      maxHeight: '90vh'
    });
  }

  ngOnDestroy(): void {
    this.ref.unsubscribe();
  }
}
