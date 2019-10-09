import {Component, NgModule, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DataService} from '../../services/data.service';
import {CountryService} from '../../services/country.service';
import {Router, ActivatedRoute, Params, ParamMap} from '@angular/router';
import {Validators, FormGroup, FormArray, FormBuilder} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {DragulaService} from 'ng2-dragula/ng2-dragula';
import {SavePdfService} from '../../services/save-pdf.service';
import {DayComponent} from './day/day.component';
import {CommentComponent} from './comment/comment.component';
import {PaymentComponent} from './payment/payment.component';
import {ImageSelectorComponent} from './image-selector/image-selector.component';
import {AddCountryNumberComponent} from './add-country-number/add-country-number.component';
import {ConfirmComponent} from '../../shared/confirm/confirm.component';
import {MONTHS} from '../../model/months';
import {EXCLUSIONS} from '../../model/exclusions';
import {GridImageTiles} from '../../model/gridImageTiles';
import {Country} from '../../model/country';
import {ItinerariesComponent} from '../itineraries.component';
import {CommonModule} from '@angular/common';
import {AppRoutingModule} from '../../app-routing.module';
import {switchMap} from 'rxjs/operators';
// @ts-ignore
import {STATUS} from '../../model/statuses';

@NgModule({
  imports: [CommonModule]
})

@Component({
  selector: 'app-itinerary-editor',
  styleUrls: ['./itinerary-editor.component.css'],
  templateUrl: './itinerary-editor.component.html'
})
export class ItineraryEditorComponent implements OnInit {
  private navigationParams: any;
  itinerary: any;
  user: any;
  id: string;
  error: any;
  totalDays: any = 0;
  remainingDays: any;
  usedDays: any;
  inventory: any;
  days: any;
  _DAYS = [];
  inclusions = [];
  adults = 0;
  children = 0;
  total = 0;
  deposit = 0;
  discount = 0;
  totalPayments = 0;
  comments = [];
  payments = [];
  startdate: any;
  enddate: any;
  statuses = STATUS;
  dayTitles = new Map([]);
  lastUsedParams = {
    country: 0,
    region: 0
  };
  tileColor = '#d8d8d8';
  coverImageTile = null;
  gridImageTiles = new GridImageTiles();
  countries = [];
  currentCompany: any;
  color: any;
  lesserButtonStyle: any;
  itinerary$: any;

  constructor(private router: Router, private route: ActivatedRoute, public data: DataService, private formbuilder: FormBuilder,
              public dialog: MatDialog, private dragula: DragulaService, private savepdf: SavePdfService, private snackBar: MatSnackBar,
              private http: HttpClient, private countryservice: CountryService) {

  }

  ngOnInit(): void {

    console.log(this.statuses)
    // get itinerary
    this.itinerary$ = JSON.parse(this.route.snapshot.paramMap.get('itinerary'));

    // todo: convert start date and end date on front end
    /* calculate total days by converting dates into milliseconds, subtracting and
divide by 86400000 which is the number of milliseconds equal to a editor-components */
    this.totalDays = Math.round((Date.parse(this.itinerary$.enddate) - Date.parse(this.itinerary$.startdate)) / 86400000);
    this.totalDays++;

    // todo: status assigned on front end from itinerary
    // todo: show in front end from itinerary$ check if total is defined, check if deposit is defined, check if discount is defined
    // assign exclusions if not defined
    if (this.itinerary$.exclusions === null) {
      this.itinerary$.exclusions = EXCLUSIONS;
    }

    // todo: move to front end from itinerary$ assign children to local variable, assign adults to local variable, assign cover image, assign images

    // get itinerary
    // this.itinerary = this.data.getSingleItem(this.id, `itineraries/${this.data.currentCompany}`)
    //   .snapshotChanges()
    //   .subscribe((snapshots) => {
    //     console.log(snapshots.payload.toJSON());
    //   });

    // get days related to itinerary id
    this.days = this.data.af.list('days/' + this.id, ref => ref.orderByChild('position'))
      .snapshotChanges()
      .subscribe(res => {
        // reset temp inclusions array, used days and temp days array
        const _INCLUSIONS = [];
        this.usedDays = 0;
        this._DAYS = [];

        // assign _days array
        res.forEach((data) => {
          const day = data.payload.toJSON;
          // iterate days to find out how many days are used
          this.usedDays += Math.round(parseInt(day[`days`], 10));

          // iterate days and store all inclusions from all accommodations in array
          // check if accommodation is present for day
          if (day[`accommodation`] !== undefined) {
            // iterate accommodation
            day[`accommodation`].forEach(accommodation => {
              // copy day key into inclusions array
              accommodation.day = day[`$key`];
              _INCLUSIONS.push(accommodation);
            });
          }

          // add day to _days array
          this._DAYS.push(data);
        });

        // filter array to include only unique values
        this.inclusions = _INCLUSIONS.filter((obj, pos, arr) => {
          return arr.map(mapObj => mapObj.name).indexOf(obj.name) === pos;
        });
      });

    // get comments related to itinerary id
    this.data.getList('comments/' + this.id)
      .snapshotChanges()
      .subscribe(res => {
        res.forEach(comment => {
          this.comments.push(comment);
        });
      });

    // get payments related to itinerary id
    this.data.af.list('payments/' + this.id)
      .snapshotChanges()
      .subscribe(res => {
        // reset total payments
        this.totalPayments = 0;
        if (res.length !== 0) {
          // iterate payments
          res.forEach(payment => {
            // add payment to total payments
            this.totalPayments += parseFloat(payment.payload.toJSON[`amount`]);
            // push payment to array
            this.payments.push(payment);
          });
        }
      });

    // get contact numbers associated with itinerary
    this.data.af.list(`phone_numbers/${this.id}`)
      .snapshotChanges()
      .subscribe(res => {
        // check if countries are set
        if (res.length > 0) {
          // iterate countries array
          res.forEach((country) => {
            // push to local countries array
            this.countries.push(country);
          });
        }
      });
  }

  onSelect(event: any) {

  }

  saveAsPdfPartial() {

  }

  saveAsPdf(costs: boolean) {

  }

  openDelete() {

  }

  duplicateItinerary() {

  }

  openEditItinerary() {

  }

  onKeyUpInclusions($event: FocusEvent, accommodation: any) {
  }

  getName(client: any, clients: string) {
  }
}
