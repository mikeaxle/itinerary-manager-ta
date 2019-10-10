import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../services/data.service';
import { Observable } from 'rxjs';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Router} from '@angular/router';
import {EditorComponent} from '../shared/editor/editor.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-itineraries',
  styleUrls: ['./itineraries.component.scss'],
  templateUrl: './itineraries.component.html'

})
export class ItinerariesComponent implements OnInit, OnDestroy {
  displayedColumns = ['#', 'Date', 'Client', 'Itinerary', 'Value', 'Status'];
  dataSource: MatTableDataSource<any>;
  itineraries;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  private error: any
  ref;

  constructor(public data: DataService, private bottomSheet: MatBottomSheet, public router: Router) {
  }

  ngOnInit() {
    // todo: add dummy data
    // const dummydata = [
    //   this.data.sampleData.itineraries['Planet Africa']['-L6VmNj-yY1NiNsV4_eZ'],
    //   this.data.sampleData.itineraries['Planet Africa']['-L6WvcFAHVIMplaQqKdf'],
    //   this.data.sampleData.itineraries['Planet Africa']['-L745WMaomnzBEVhzN2j'],
    //   this.data.sampleData.itineraries['Planet Africa']['-L7ZJtvIw5r_0FophV5V'],
    // ];

    // init itineraries array
    this.itineraries = [];

    // get itineraries
    this.ref = this.data.af.list(`itineraries/${this.data.currentCompany}/`, ref => ref.limitToLast(100))
    .snapshotChanges()
      .subscribe(snapshots => {

        // iterate snapshots
        snapshots.forEach(snapshot => {
          // get itinerary
          let itinerary = {};
          itinerary = snapshot.payload.val();

          // get key
          itinerary[`key`] = snapshot.key;

          // push to itineraries array
          this.itineraries.push(itinerary);
        });

        // init data source
        this.dataSource = new MatTableDataSource(this.itineraries);

        // init data source
        this.dataSource.paginator = this.paginator;

        // init sort
        this.dataSource.sort = this.sort;
      });

  }

  // function to get client name
  getName(key: string, type: string) {
    // client\agent name string
    // let string = '';
    // get from firebase
    // this.data.getSingleItem(key, `${type}/${this.data.currentCompany}/`)
    //   .valueChanges()
    //   .subscribe((res) => {
    //     const client = res;
    //     // concat first name and last name
    //     return client[`firstname`]  + ' ' + client[`lastname`] ;
    //   });
    // return full name
    // return string;
  }

  // function to delete item
  deleteItinerary(id: string) {
    this.data.deleteItem(id, 'itineraries')
      .then(() => {
        Swal.fire('Success', 'Itinerary deleted', 'success');
        console.log('itinerary deleted');
      })
      .catch((error) => {
        this.error = error;

        Swal.fire('Failed', `An error has occurred: ${error.message}`, 'error');
      });
  }

  // filter function
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  // function to add new itinerary
  addNew() {
    this.bottomSheet.open(EditorComponent, {
      data: {
        item: null,
        new: true,
        type: 'itinerary'
      }
    });
  }

  editItinerary(itinerary) {
    // stringify itinerary and send as router param
    this.router.navigate(['/itinerary-editor', JSON.stringify(itinerary)]);
  }

  ngOnDestroy(): void {
    this.ref.unsubscribe();
  }
}
