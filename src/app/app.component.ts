import {Component, Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
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
  user = this.getItem('user')
  url;

  constructor(public router: Router, public data: DataService) {
  }

  // getter
  getItem(key: string): any {
    return key === 'company' ? localStorage.getItem(key) : JSON.parse(localStorage.getItem(key));
  }


  getLogo() {
    return localStorage.getItem('logo')
  }


  // function to logout
  logout() {
    localStorage.clear();
    this.data.afAuth.auth.signOut()
    .then(() => {
      this.router.navigate(['login'])
      .then(() => {
        // delete local storage
        Swal.fire('Authentication', 'Logged out', 'success')
      });
    })
  }
}
