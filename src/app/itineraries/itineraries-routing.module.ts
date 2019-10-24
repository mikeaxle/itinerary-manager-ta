import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {ItinerariesComponent} from './itineraries.component';
import {ItineraryEditorComponent} from './itinerary-editor/itinerary-editor.component';


const routes: Routes = [
  { path: 'itineraries', component: ItinerariesComponent },
  { path: 'itinerary-editor/:id', component: ItineraryEditorComponent }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class ItinerariesRoutingModule { }
