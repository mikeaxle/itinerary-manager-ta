import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Country} from '../model/country';
import {Region} from '../model/region';
import {MatDialog, MatPaginator, MatTableDataSource} from '@angular/material';
import {Router} from '@angular/router';
import {DataService} from '../services/data.service';
import {ConfirmComponent} from '../shared/confirm/confirm.component';
import {EditorComponent} from '../shared/editor/editor.component';

// region interface
export interface  RegionInCountry {
  id: number;
  name: string;
}

// country interface
export interface CountryWithRegions {
  id?: number;
  name: string;
  regions: RegionInCountry[];
  phoneNumbers: [];
  flag: string;
  code: string;
}


@Component({
  selector: 'app-countries',
  styleUrls: ['./countries.component.css'],
  templateUrl: './countries.component.html'
})
export class CountriesComponent implements OnInit, OnDestroy {
  countries = [];
  error: any;
  displayedColumns = [ 'Name', 'Regions', 'Phone Numbers', 'Flag', 'Code', 'Actions'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  // @ViewChild(MatSort, {static: true}) sort: MatSort;
  private ref;
  private countriesSubscription$;

  constructor(public router: Router, public data: DataService, public dialog: MatDialog) {}

  ngOnInit() {
    // get countries
    this.countriesSubscription$ = this.data.firestore.collection('countries')
      .snapshotChanges()
      .subscribe(snapshots => {
        // init countries array
        this.countries = [];

        snapshots.forEach(snapshot => {
          let item = {};
          item = snapshot.payload.doc.data();
          item[`key`] = snapshot.payload.doc.id;
          this.countries.push(item);
        });

        // init data source
        this.dataSource = new MatTableDataSource(this.countries);

        // init data source
        this.dataSource.paginator = this.paginator;

        // init sort
        // this.dataSource.sort = this.sort;
      });
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
          this.deleteCountry(item);
        }
      }
    });
  }

  // function to delete item
  deleteCountry(item) {
    this.data.deleteObjectFromFirebase(`countries/${item.key}`, 'country');
  }

  // function to add new inventory item
  addNew() {
    this.dialog.open(EditorComponent, {
      data: {
        item: null,
        new: true,
        type: 'countries'
      },
      maxHeight: '700',
      maxWidth: '60vw'
    });
  }

// function to edit inventory item
  editCountry(country) {
    this.dialog.open(EditorComponent, {
      data: {
        item: country,
        new: false,
        type: 'countries'
      },
      maxHeight: '700',
      maxWidth: '60vw',
      position: {
        top: '100px'
      }
    });
  }

  ngOnDestroy(): void {
    this.countriesSubscription$.unsubscribe();
  }
}
