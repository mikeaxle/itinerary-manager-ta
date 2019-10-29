import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../services/data.service';
import {MatBottomSheet, MatBottomSheetRef, MatDialog} from '@angular/material';
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
  private error: any;
  ref;

  constructor(public data: DataService, private matDialog: MatDialog, public router: Router) {
  }

  ngOnInit() {
    // init itineraries array
    this.itineraries = [];

    // get itineraries
    this.ref = this.data.af.list(`itineraries/${this.data.company}/`, ref => ref.limitToLast(250))
    // this.ref = this.data.af.list(`itineraries/${this.data.company}/`)
    .snapshotChanges()
      .subscribe(snapshots => {

        // iterate snapshots
        snapshots.forEach(snapshot => {
          // get itinerary
          let itinerary = {};
          itinerary = snapshot.payload.val();

          // get key
          itinerary[`key`] = snapshot.key;

          // check if client is string
          if (this.checkIfObjectIsString(itinerary[`client`])) {
            itinerary[`fullName`] = this.data.af.object(`clients/${this.data.company}/${itinerary[`client`]}`).valueChanges();
          } else if (typeof itinerary[`client`] == 'object') {
            itinerary[`fullName`] = itinerary[`client`][`firstname`] + ' ' + itinerary[`client`][`lastname`];
          } else {
            itinerary[`fullName`] = 'N/A';
          }



          // push to itineraries array
          this.itineraries.push(itinerary);
        });

        // init data source
        this.dataSource = new MatTableDataSource(this.itineraries.reverse());

        // init data source
        this.dataSource.paginator = this.paginator;

        // init sort
        this.dataSource.sort = this.sort;
      });

  }



  // function to check if an object is a string
  checkIfObjectIsString(object) {
    return typeof object == 'string';
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

  // function to add new itinerary
  addNew() {
    this.matDialog.open(EditorComponent, {
      data: {
        item: null,
        new: true,
        type: 'itinerary'
      }
    });
  }

  editItinerary(itinerary) {
    // stringify itinerary and send as router param
    this.router.navigate(['/itinerary-editor', itinerary.key]);
  }

  ngOnDestroy(): void {
    this.ref.unsubscribe();
  }
}
