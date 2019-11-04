import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {DataService} from '../services/data.service';
import {MatBottomSheet, MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from '@angular/material';
import {ConfirmComponent} from '../shared/confirm/confirm.component';
import {PermissionDeniedDialogComponent} from '../shared/permission-denied-dialog/permission-denied-dialog.component';
import {EditorComponent} from '../shared/editor/editor.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clients',
  styleUrls: ['./clients.component.css'],
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit, OnDestroy {

  displayedColumns = ['Name', 'Email', 'Actions'];
  private error: any;
  dataSource: MatTableDataSource<any>;
  clients;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  // @ViewChild(MatSort, {static: true}) sort: MatSort;
  private ref;
  public dialogRef;

  constructor(public data: DataService, public dialog: MatDialog) { }

  ngOnInit() {
    // todo: dummy data
    // const dummydata = [
    //   this.data.sampleData.clients['Planet Africa']['-L4p6t_H3UiPg4gSXzGS'],
    //   this.data.sampleData.clients['Planet Africa']['-L6Mm55Z_5R3AFZO3ghM'],
    //   this.data.sampleData.clients['Planet Africa']['-L6VlsQXLu6C07ZVkJSw'],
    //   this.data.sampleData.clients['Planet Africa']['-L6WvESKO4asYrQvEyZK'],
    //
    // ];

    // init clients array
    this.clients = [];

    // get clients
    this.ref = this.data.firestore.collection(`clients`, ref => ref.where('company', '==', this.data.company.id))
      .snapshotChanges()
      .subscribe(snapshots => {
        snapshots.forEach(snapshot => {
          const client = snapshot.payload.doc.data();
          client[`key`] = snapshot.payload.doc.id;
          this.clients.push(client);
        });
        // init data source
        this.dataSource = new MatTableDataSource(this.clients.reverse());

        // init data source
        this.dataSource.paginator = this.paginator;

        // init sort
        // this.dataSource.sort = this.sort;

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
          this.deleteClient(id);
        }
      }
    });
  }

  // function to check if client has existing itineraries and show dialog
  openPermissionDenied() {
    const dialogRef = this.dialog.open(PermissionDeniedDialogComponent, {
      data: 'You cannot delete a client with existing itineraries',
      width: '480px',
    });
  }

  // function to delete item
  deleteClient(id: string) {
    // get itineraries
    // this.data.af.list(`itineraries/${this.data.company}`,
    //   ref => ref.orderByChild('client').equalTo(id).limitToFirst(1))
    //   .snapshotChanges()
    //   .subscribe((res) => {
    //     // check if client has itineraries
    //     if (res.length === 1) {
    //       this.openPermissionDenied();
    //       // alert('Cannot delete a client with existing itineraries')
    //     } else {
    //       this.data.deleteItem(id, `clients/${this.data.company}/`)
    //         .then(() => {
    //           console.log('client deleted');
    //         })
    //         .catch((error) => {
    //           this.error = error;
    //         });
    //     }
    //   });
    // todo: check if user has itineraries

    // delete client
    this.data.firestore.doc(`clients/${id}`)
      .delete()
      .then(() => {
        console.log('client deleted');
        Swal.fire('Client Editor', 'Client deleted: ' + id, 'error');
      })
      .catch((err) => {
        this.error = err;
        Swal.fire('Client Editor', 'Failed to delete client: ' + err.message, 'error');
      });
  }

  // function to add client
  addNew() {
    // todo: add arguments to editor component for type, mode, and data
    this.dialog.open(EditorComponent, {
      data: {
        item: null,
        new: true,
        type: 'clients',
      }
    });
  }

  editClient(client: any) {
     this.dialogRef = this.dialog.open(EditorComponent, {
      data: {
        item: client,
        new: false,
        type: 'clients',
      }
    });

     this. dialogRef.afterClosed().subscribe(() => {

     });
  }

  ngOnDestroy(): void {
    this.ref.unsubscribe();
  }
}
