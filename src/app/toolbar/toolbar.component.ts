import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-toolbar',
  styleUrls: ['./toolbar.component.css'],
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent {

  user = this.getItem('user');
  url;
  // isPlanetAfrica: any;

  constructor(public router: Router, public data: DataService) {
  }

  isPlanetAfrica()  {
    return localStorage.getItem('company') === 'Planet Africa';
  }

  // getter
  getItem(key: string): any {
    return key === 'company' ? localStorage.getItem(key) : JSON.parse(localStorage.getItem(key));
  }


  getLogo() {
    return localStorage.getItem('logo');
  }


  // function to logout
  logout() {
    localStorage.clear();
    this.data.afAuth.auth.signOut()
      .then(() => {
        this.router.navigate(['login'])
          .then(() => {
            // delete local storage
            Swal.fire('Authentication', 'Logged out', 'success');
          });
      });
  }
}
