import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DataService } from '../services/data.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EditorComponent } from '../shared/editor/editor.component';
import Swal from 'sweetalert2';
import { STATUS } from '../model/statuses';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';


@Component({
  selector: 'app-itineraries',
  styleUrls: ['./itineraries.component.scss'],
  templateUrl: './itineraries.component.html',
  encapsulation: ViewEncapsulation.None

})
export class ItinerariesComponent implements OnInit, OnDestroy {
  displayedColumns = ['#', 'Date', 'Client', 'Itinerary', 'Value', 'Status'];
  dataSource: MatTableDataSource<any>;
  itineraries = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  private error: any;
  itinerariesRef$;
  status$: BehaviorSubject<string | null>;
  companyRef$: any;
  status = 'Provisional';
  agents = [];
  agentsSubscription$;
  agent;
  agent$: BehaviorSubject<string | null>;
  itinerariesSubscription$: any;
  STATUS = STATUS;


  constructor(public data: DataService, private matDialog: MatDialog, public router: Router, public snackBar: MatSnackBar) {
    // init agents filter
    this.agent$ = new BehaviorSubject(null);

    // init status filter
    this.status$ = new BehaviorSubject(this.status);

    // // get company ref
    this.companyRef$ = this.data.firestore.doc(`companies/${this.data.company.key}`).ref;

    // // get itineraries ref
    this.itinerariesRef$ = Observable.combineLatest([this.agent$, this.status$])
    .switchMap(([agent, status]) => 
      this.data.firestore.collection('itineraries', ref => {
        // cast ref as firestore query
        let query: firebase.firestore.Query = ref;
        
        // if agent
        if (agent) {
          // get agent ref
          const agentRef = this.data.firestore.doc(`users/${agent}`).ref
          // filter by agent
          query = query.where('agent', '==', agentRef);
        }

        // if status
        if (status) {
          // filter by status
          query = query.where('status', '==', status)
        }
        return query;
      }).snapshotChanges()
    );
  }

  ngOnInit() {
    // get agents
    this.agentsSubscription$ = this.data.firestore.collection(`users`)
      .snapshotChanges()
      .subscribe(snapshots => {
        this.agents = [];

        snapshots.forEach(snapshot => {
          const agent = snapshot.payload.doc.data();
          agent[`key`] = snapshot.payload.doc.id;
          this.agents.push(agent);
        });
      });

    // get itineraries
    this.itinerariesSubscription$ = this.itinerariesRef$
      .subscribe(snapshots => {
        this.itineraries = [];
        // iterate snapshots
        snapshots.forEach(snapshot => {
          // get itinerary
          let itinerary = {};
          itinerary = snapshot.payload.doc.data();

          // get key
          itinerary[`key`] = snapshot.payload.doc.id;

          // get client details and add to itinerary info
          try {
            itinerary[`client`].get()
              .then(res => {
                const client = res.data();
                itinerary[`clientFullName`] = `${client.firstName} ${client.lastName}`;
              });

          } catch (e) {
            console.log(itinerary);
          }

          // push to itineraries array
          this.itineraries.push(itinerary);
        });

        // init data source
        this.dataSource = new MatTableDataSource(this.itineraries.reverse());

        // init data source
        this.dataSource.paginator = this.paginator;
      });

  }

  // function to delete item
  deleteItinerary(id: string) {
    this.data.firestore.doc(`itineraries/${id}`)
      .delete()
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

  // function to filter by status
  // onFilterChange(event) {
  //   // empty itineraries array
  //   this.itineraries = [];

  //   // perform next query
  //   this.status$.next(event.source.value);

  //   // Swal
  //   event.source.value === undefined ? Swal.fire('Reloading Itineraries', 'Getting all itineraries', 'info') :
  //   this.snackBar.open('Reloading Itineraries', `Filtering by status: "${event.source.value}"`, {
  //     duration: 3000
  //   });
  // }

  filterByStatus() {
    this.status$.next(this.status);
  }

  filterByAgent() {
    this.agent$.next(this.agent);
  }

  ngOnDestroy(): void {
    this.itinerariesRef$ = null;
    this.itinerariesSubscription$.unsubscribe();
  }
}
