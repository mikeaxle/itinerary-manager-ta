import {Component, Injectable} from '@angular/core';
import { Router} from '@angular/router';
import Swal from 'sweetalert2';
import { DataService } from './services/data.service';

@Injectable()
@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'itinerary-manager-ta';
}
