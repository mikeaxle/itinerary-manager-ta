import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AngularFireAuthGuard, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import {ItinerariesComponent} from './itineraries.component';
import {ItineraryEditorComponent} from './itinerary-editor/itinerary-editor.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  {
    canActivate: [AngularFireAuthGuard],
    component: ItinerariesComponent,
    data: {
      authGuardPipe: redirectUnauthorizedToLogin,
    },
    path: 'itineraries',

  },
  {
    canActivate: [AngularFireAuthGuard],
    component: ItineraryEditorComponent,
    data: {
      authGuardPipe: redirectUnauthorizedToLogin,
    },
    path: 'itinerary-editor/:id',

  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class ItinerariesRoutingModule { }
