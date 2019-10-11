import {Component, Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable()
@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'itinerary-manager-ta';

  constructor(public router: Router) {}

  // getter
  getItem(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }

  // function to logout
  logout() {
    this.router.navigate(['login'])
      .then(() => {
        // delete local storage
        localStorage.clear();
      });
  }
}
