import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItinerariesRoutingModule } from './itineraries-routing.module';
import {ItineraryEditorComponent} from './itinerary-editor/itinerary-editor.component';
import { ItineraryDetailsEditorComponent } from './itinerary-editor/itinerary-details-editor/itinerary-details-editor.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatCardModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatGridListModule, MatIconModule, MatInputModule, MatMenuModule, MatOptionModule, MatProgressBarModule, MatProgressSpinnerModule, MatSelectModule} from '@angular/material';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {FlexLayoutModule} from '@angular/flex-layout';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {AppModule} from '../app.module';
import {CommentsPipe} from '../filter/comments.pipe';
import {DragDropModule} from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [
    ItineraryEditorComponent,
    ItineraryDetailsEditorComponent,
    CommentsPipe
  ],
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
    MatCardModule,
    MatChipsModule,
    MatInputModule,
    CurrencyMaskModule,
    MatIconModule,
    MatGridListModule,
    MatDialogModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    DragDropModule
  ],
})
export class ItinerariesModule { }
