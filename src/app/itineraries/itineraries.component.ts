import {Component, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../data.service';
import { Observable } from 'rxjs';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Router} from '@angular/router';
import {EditorComponent} from '../editor/editor.component'

@Component({
  selector: 'app-itineraries',
  templateUrl: './itineraries.component.html',
  styleUrls: ['./itineraries.component.scss']
})
export class ItinerariesComponent implements OnInit {
  displayedColumns = ['#', 'Date', 'Client', 'Itinerary', 'Value', 'Status'];
  dataSource: MatTableDataSource<any>;
  itineraries: Observable<any[]>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(public data: DataService, private bottomSheet: MatBottomSheet, public router: Router) {
  }

  ngOnInit() {
    // add dummy data
    const dummydata = [
    this.data.sampleData.itineraries['Planet Africa']['-L6MmQF4jj7AbmUUVdua'],
    this.data.sampleData.itineraries['Planet Africa']['-L6VmNj-yY1NiNsV4_eZ'],
    this.data.sampleData.itineraries['Planet Africa']['-L6WvcFAHVIMplaQqKdf'],
    this.data.sampleData.itineraries['Planet Africa']['-L745WMaomnzBEVhzN2j'],
    this.data.sampleData.itineraries['Planet Africa']['-L7ZJtvIw5r_0FophV5V']
    ];

    // init data source
    this.dataSource = new MatTableDataSource(dummydata);


    // init data source
    this.dataSource.paginator = this.paginator;

    // init sort
    this.dataSource.sort = this.sort;
  }

  getName(client: any, clients: string) {
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  // function to add new itinerary
  addNew() {
    this.bottomSheet.open(EditorComponent);
  }

  editItinerary(itinerary) {
    this.router.navigate(['itinerary-editor', { queryParams:  { 'itinerary': itinerary }} ]);
  }
}
