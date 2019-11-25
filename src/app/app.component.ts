import {Component, Injectable} from '@angular/core';
import {DataService} from './services/data.service';

@Injectable()
@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'itinerary-manager-ta';
  constructor(public data: DataService) {}
}
