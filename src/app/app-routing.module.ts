import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ItinerariesComponent} from './itineraries/itineraries.component';
import {AngularFireAuthGuard} from '@angular/fire/auth-guard';
import {ItineraryEditorComponent} from './itinerary-editor/itinerary-editor.component';


const routes: Routes = [
  { path: '', redirectTo: 'itineraries', pathMatch: 'full' },
  { path: 'itineraries', component: ItinerariesComponent  },
  { path: 'itinerary-editor', component: ItineraryEditorComponent  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
