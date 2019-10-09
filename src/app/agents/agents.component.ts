import {Component, OnInit, ViewChild} from '@angular/core';
import {MatBottomSheet, MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ConfirmComponent} from '../shared/confirm/confirm.component';
import {Router} from '@angular/router';
import {componentDestroyed} from 'ng2-rx-componentdestroyed';
import {DataService} from '../services/data.service';
import {PermissionDeniedDialogComponent} from '../shared/permission-denied-dialog/permission-denied-dialog.component';
import {EditorComponent} from '../shared/editor/editor.component';

@Component({
  selector: 'app-agents',
  templateUrl: './agents.component.html',
  styleUrls: ['./agents.component.css']
})
export class AgentsComponent implements OnInit {
  // variable to store error
  error: any;
  displayedColumns = ['Name', 'Email', 'Role', 'Actions'];
  dataSource: MatTableDataSource<any>;

  // inject data worked and router into component
  loggedInUser: any;
  currentCompany: any;
  color: any;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;


  constructor(public router: Router, private data: DataService, public dialog: MatDialog, public bottomSheet: MatBottomSheet) {}

  ngOnInit() {
    // todo: link to live database
    const dummydata = [
      this.data.sampleData.users['5oPFb9A68mgbFJm3VtdfWCn9Yoc2'],
      this.data.sampleData.users['5oPFb9A68mgbFJm3VtdfWCn9Yoc2'],
      this.data.sampleData.users['5oPFb9A68mgbFJm3VtdfWCn9Yoc2'],
      this.data.sampleData.users['5oPFb9A68mgbFJm3VtdfWCn9Yoc2'],
      this.data.sampleData.users['5oPFb9A68mgbFJm3VtdfWCn9Yoc2'],
      this.data.sampleData.users['5oPFb9A68mgbFJm3VtdfWCn9Yoc2'],
    ];

    // init data source
    this.dataSource = new MatTableDataSource(dummydata);

    // init data source
    this.dataSource.paginator = this.paginator;

    // init sort
    this.dataSource.sort = this.sort;
  }

  // function to open confirm delete dialog
  openDelete(id) {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '480px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        // if result is true
        if (result) {
          this.deleteAgent(id);
        }
      }
    });
  }

  openPermissionDenied() {
    const dialogRef = this.dialog.open(PermissionDeniedDialogComponent, {
      data: 'You cannot delete an agent with existing itineraries',
      width: '480px',
    });
  }

  // function to delete item
  deleteAgent(id: string) {

    if (this.loggedInUser.uid === id) {
      alert('Cannot delete the user you are currently logged in as');
    } else  {
      this.data.af.list(`itineraries/${this.currentCompany}`, ref => ref.orderByChild('agent').equalTo(id).limitToFirst(1))
        .snapshotChanges()
        .subscribe((res) => {
          // check if agent has itineraries
          if (res.length > 0) {
            this.openPermissionDenied();
          } else {
            this.data.deleteItem(id, 'users')
              .then(() => {
                // this.data.afAuth.auth.
                console.log('agent deleted');
              })
              .catch((error) => {
                this.error = error;
              });
          }
        });
    }
  }

  // fucntion to add new agent
  addNew(agent) {
    this.bottomSheet.open(EditorComponent);
  }

  // function to edit agent
  editAgent(agent) {
    this.bottomSheet.open(EditorComponent);
  }
}
