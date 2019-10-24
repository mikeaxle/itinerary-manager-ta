import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {ClientsComponent} from './clients/clients.component';
import {InventoryComponent} from './inventory/inventory.component';
import {MediaComponent} from './media/media.component';
import {AgentsComponent} from './agents/agents.component';
import {LoginComponent} from './login/login.component';
import {AngularFireAuthGuard, redirectUnauthorizedTo} from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    component: LoginComponent,
    path: 'login'
  },
  {
    canActivate: [AngularFireAuthGuard],
    data: {
      authGuardPipe: redirectUnauthorizedToLogin,
      preload: true,
    },
    loadChildren: () => import('./itineraries/itineraries.module').then(mod => mod.ItinerariesModule),
    path: 'itineraries'
  },
  {
    canActivate: [AngularFireAuthGuard],
    component: ClientsComponent,
    data: {
      authGuardPipe: redirectUnauthorizedToLogin,
    },
    path: 'clients'
  },
  {
    canActivate: [AngularFireAuthGuard],
    component: InventoryComponent,
    data: {
      authGuardPipe: redirectUnauthorizedToLogin,
    },
    path: 'inventory'
  },
  {
    canActivate: [AngularFireAuthGuard],
    component: MediaComponent,
    data: {
      authGuardPipe: redirectUnauthorizedToLogin,
    },
    path: 'media'
  },
  {
    canActivate: [AngularFireAuthGuard],
    component: AgentsComponent,
    data: {
      authGuardPipe: redirectUnauthorizedToLogin,
    },
    path: 'agents'
  },
  {
    canActivate: [AngularFireAuthGuard],
    component: PageNotFoundComponent,
    data: {
      authGuardPipe: redirectUnauthorizedToLogin,
    },
    path: '**'
  },
];


@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)],
})
export class AppRoutingModule { }
