import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-search',
  styleUrls: ['./search.component.css'],
  templateUrl: './search.component.html'

})
export class SearchComponent implements OnInit {
  @Input() dataSource: any;
  @Input() caller: string;
  @Output() filteredDataSource = new EventEmitter<any>();
  placeholder: any;

  constructor() {

  }

  ngOnInit() {
    // set place holder text
    this.placeholder = `search ${this.caller}`;
  }

  // filter function
  applyFilter(filterValue: string) {
    // filter data source
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // check if the filtered data has a source
    if (this.dataSource.paginator) {
      // reset paginator to first page
      this.dataSource.paginator.firstPage();
    }

    // emit filtered data base back to parent
    this.filteredDataSource.emit(this.dataSource);
  }
}
