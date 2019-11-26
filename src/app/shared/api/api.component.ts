import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {CountryService} from '../../services/country.service';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.css']
})
export class ApiComponent implements OnInit {
  list = [];
  daysCollection;
  constructor(public data: DataService, public countryService: CountryService) {}

  ngOnInit() {
    // const countryRef = this.data.firestore.collection('countries').doc('hN8EEHsmXjGd19fxQzjl');
    this.data.firestore.collection('inventory', ref => ref.where('region', '==', 41))
    .snapshotChanges()
    .subscribe(_ => {
      _.forEach(element => {
        const item = {...element.payload.doc.data(), key: element.payload.doc.id}

        element.payload.doc.ref.update({
          region: 'Winelands'
        })
        .then(res => {
          console.log('item updated')
        })
        .catch(err => {
          console.log(err.message)
        })
      });
    });

    // migrate days
    // this.daysCollection = this.data.firestore.collection('days');
    // this.data.database.list('itineraries/' + this.data.company.name)
    //   .snapshotChanges()
    //   .subscribe(_ => {
    //     _.forEach(__ => {
    //       const itinerary = { ...__.payload.val(), key: __.key};
    //
    //       this.data.database.list('days/' + itinerary[`key`])
    //         .snapshotChanges()
    //         .subscribe(snapshots => {
    //           snapshots.forEach(snapshot => {
    //             const item = snapshot.payload.val();
    //             item[`key`] = snapshot.key;
    //             item[`region`] = this.countryService.getRegionName(item[`region`]);
    //             item[`country`] = this.data.firestore.doc('countries/' + this.countryService.getDestination(item[`country`]).key).ref;
    //             item[`itinerary`] = this.data.firestore.doc('itineraries/' + itinerary[`key`]).ref;
    //             // console.log(this.countryService.getDestination(item[`country`]))
    //             if (item[`accommodation`]) {
    //               item[`accommodation`].forEach(accommodation => {
    //                 // accommodation[`destination`] = this.data.firestore.doc(`countries`)
    //                 accommodation[`region`] = this.countryService.getRegionName(accommodation[`region`]);
    //                 accommodation[`destination`] = this.data.firestore.doc('countries/' + this.countryService.getDestination(accommodation[`destination`]).key).ref;
    //                 accommodation[`longDescription`] = accommodation[`long_description`];
    //                 delete accommodation[`long_description`];
    //               });
    //             }
    //
    //             this.data.firestore.collection('days').doc(item[`key`]).set(item)
    //               .then(() => {
    //                 console.log('added item');
    //               })
    //               .catch(err => {
    //                 console.log(err);
    //               });
    //
    //             // this.daysCollection.doc(item[`key`]).set(item)
    //             //   .then(res => {
    //             //     console.log('item added');
    //             //   })
    //             //   .catch(err => {
    //             //     console.log(err);
    //             //   });
    //           });
    //
    //           // console.log(this.list[0])
    //         });
    //
    //     });
    //   });

  }

}
