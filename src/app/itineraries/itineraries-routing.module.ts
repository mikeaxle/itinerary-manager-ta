import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {ItinerariesComponent} from './itineraries.component';
import {ItineraryEditorComponent} from './itinerary-editor/itinerary-editor.component';


const routes: Routes = [
  { path: 'itineraries', component: ItinerariesComponent },
  { path: 'itinerary-editor/:itinerary', component: ItineraryEditorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItinerariesRoutingModule { }
