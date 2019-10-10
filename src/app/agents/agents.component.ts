import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatBottomSheet, MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ConfirmComponent} from '../shared/confirm/confirm.component';
import {Router} from '@angular/router';
import {DataService} from '../services/data.service';
import {PermissionDeniedDialogComponent} from '../shared/permission-denied-dialog/permission-denied-dialog.component';
import {EditorComponent} from '../shared/editor/editor.component';

@Component({
  selector: 'app-agents',
  templateUrl: './agents.component.html',
  styleUrls: ['./agents.component.css']
})
export class AgentsComponent implements OnInit, OnDestroy {

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
  agents: any;
  ref: any;


  constructor(public router: Router, public data: DataService, public dialog: MatDialog, public bottomSheet: MatBottomSheet) {}

  ngOnInit() {
    // todo: dummy data
    // const dummydata = [
    //   this.data.sampleData.users['5oPFb9A68mgbFJm3VtdfWCn9Yoc2'],
    //   this.data.sampleData.users['5oPFb9A68mgbFJm3VtdfWCn9Yoc2'],
    //   this.data.sampleData.users['5oPFb9A68mgbFJm3VtdfWCn9Yoc2'],
    //   this.data.sampleData.users['5oPFb9A68mgbFJm3VtdfWCn9Yoc2'],
    //   this.data.sampleData.users['5oPFb9A68mgbFJm3VtdfWCn9Yoc2'],
    //   this.data.sampleData.users['5oPFb9A68mgbFJm3VtdfWCn9Yoc2'],
    // ];

    this.agents = [];

    this.ref = this.data.af.list(`users`)
   .snapshotChanges()
   .subscribe(snapshots => {

     snapshots.forEach((snapshot) => {
       // get agent data
       let agent = {};
       agent = snapshot.payload.val();

       // get key
       agent[`key`] = snapshot.key;

       // push to agents array
       this.agents.push(agent);

       // init data source
       this.dataSource = new MatTableDataSource(this.agents);

       // init data source
       this.dataSource.paginator = this.paginator;

       // init sort
       this.dataSource.sort = this.sort;
     });
   });
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
    }).unsubscribe();
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
        }).unsubscribe();
    }
  }

  // function to add new agent
  addNew() {
    this.bottomSheet.open(EditorComponent, {
      data: {
        item: null,
        new: true,
        type: 'agents'
      }
    });
  }

  // function to edit agent
  editAgent(agent) {
    this.bottomSheet.open(EditorComponent, {
      data: {
        item: agent,
        new: false,
        type: 'agents'
      }
    });
  }

  ngOnDestroy(): void {
this.ref.unsubscribe();
  }
}
