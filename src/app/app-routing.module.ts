import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {ClientsComponent} from './clients/clients.component';
import {InventoryComponent} from './inventory/inventory.component';
import {MediaComponent} from './media/media.component';
import {AgentsComponent} from './agents/agents.component';
import {LoginComponent} from './login/login.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    component: LoginComponent,
    path: 'login'
  },
  {
    data: { preload: true },
    loadChildren: () => import('./itineraries/itineraries.module').then(mod => mod.ItinerariesModule),
    path: 'itineraries'
  },
  {
    component: ClientsComponent,
    path: 'clients'
  },
  {
    component: InventoryComponent,
    path: 'inventory'
  },
  {
    component: MediaComponent,
    path: 'media'
  },
  {
    component: AgentsComponent,
    path: 'agents'
  },
  {
    component: PageNotFoundComponent,
    path: '**'
  },
];


@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)],
})
export class AppRoutingModule { }
