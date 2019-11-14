import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-toolbar',
  styleUrls: ['./toolbar.component.css'],
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent {
  constructor(public router: Router, public data: DataService) {}

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
