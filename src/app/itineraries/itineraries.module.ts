import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItinerariesRoutingModule } from './itineraries-routing.module';
import {ItineraryEditorComponent} from './itinerary-editor/itinerary-editor.component';
import { ItinerariesComponent } from './itineraries.component';
import { ItineraryDetailsEditorComponent } from './itinerary-editor/itinerary-details-editor/itinerary-details-editor.component';
import {FormsModule} from '@angular/forms';
import {MatButtonModule, MatCardModule, MatMenuModule, MatOptionModule, MatProgressSpinnerModule, MatSelectModule} from '@angular/material';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {FlexLayoutModule} from '@angular/flex-layout';


@NgModule({
  imports: [
    CommonModule,
    ItinerariesRoutingModule,
    FormsModule,
    MatMenuModule,
    MatOptionModule,
    MatSelectModule,
    AngularSvgIconModule,
    FlexLayoutModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  declarations: [
    // ItinerariesComponent,
    ItineraryEditorComponent,
    ItineraryDetailsEditorComponent
  ],
})
export class ItinerariesModule { }
