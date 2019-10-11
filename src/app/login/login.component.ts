import { Component, OnInit } from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {DataService} from '../services/data.service';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  styleUrls: ['./login.component.css'],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  error: any;
  email = '';
  password = '';
  user: any;

  constructor(private router: Router, private data: DataService, private snackbar: MatSnackBar) {
    // check if user is authenticated
    this.data.afAuth.authState.subscribe(auth => {
      if (auth) {
        // check if local storage variables are defined
        if (localStorage.getItem('currentCompany') === undefined) {
          // default to True Africa
          localStorage.setItem('currentCompany', 'True Africa');
        }

        // set global color
        if (this.data.currentCompany === 'Planet Africa') {
          localStorage.setItem('color', '#AC452F');
        } else if (this.data.currentCompany === 'True Africa') {
          localStorage.setItem('color', '#B18C51');
        }

        // set logged in user
        localStorage.setItem('loggedInUser', JSON.stringify(auth));
        // if user is logged in, redirect to dashboard
        this.router.navigate(['itineraries'])
          .then(() => {
            Swal.fire('Authentication', 'You are already logged in!', 'success');
          });
      }
    });
  }

  ngOnInit() {
  }

  // function to login using email
  onSubmit(formData) {
    // check if form data is valid
    if (formData.valid) {
      // try to sign in
      this.data.afAuth.auth.signInWithEmailAndPassword(formData.value.email, formData.value.password)
        .then((auth) => {
          // set local storage
          localStorage.setItem('currentCompany', 'True Africa');
          localStorage.setItem('color', '#B18C51');

          // show swal
          Swal.fire('Authentication', 'Log in successful!', 'success');
        })
        .catch((error) => {
          console.log(error);
          this.error = error.message;

          // show swal
          Swal.fire('Authentication', `An error has occurred: ${this.error}`, 'error');
        });
    }
  }
}
