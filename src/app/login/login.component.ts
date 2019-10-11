import {Component, OnDestroy} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {DataService} from '../services/data.service';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';
import {AuthProvider} from 'ngx-auth-firebaseui';

@Component({
  selector: 'app-login',
  styleUrls: ['./login.component.css'],
  templateUrl: './login.component.html'
})


export class LoginComponent implements OnDestroy  {
  error: any;
  providers = AuthProvider;
  logo = '../assets/logos/avatar-trueafrica.png';
  user$;

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
          localStorage.setItem('logo', '../assets/logos/avatar-planetafrica.png');
        } else if (this.data.currentCompany === 'True Africa') {
          localStorage.setItem('color', '#B18C51');
          localStorage.setItem('logo', '../assets/logos/avatar-trueafrica.png');
        }

        // set logged in user
        this.user$ = this.data.af.object('users/' + auth[`uid`])
          .snapshotChanges()
          .subscribe((user) => {
            // set logged in user
            localStorage.setItem('user', JSON.stringify(user));
          });

        // if user is logged in, redirect to dashboard
        // this.router.navigate(['itineraries'])
        //   .then(() => {
        //     Swal.fire('Authentication', 'You are already logged in!', 'success');
        //   });
      }
    });
  }

  // handle login error
  onLoginError(error) {
    console.log(error);
    this.error = error.message;

    // show swal
    Swal.fire('Authentication', `An error has occurred: ${this.error}`, 'error');
  }

  ngOnDestroy(): void {
    this.user$.unsubscribe();
  }

  // handle login success
  // onLoginSuccess() {
  //   // set company
  //   localStorage.setItem('currentCompany', 'True Africa');
  //
  //   // set color
  //   localStorage.setItem('color', '#B18C51');
  //
  //   // set logo
  //   this.logo = '../assets/logos/avatar-trueafrica.png';
  //
  //   // set user
  //
  //   // show swal
  //   Swal.fire('Authentication', 'Log in successful!', 'success');
  // }

}
