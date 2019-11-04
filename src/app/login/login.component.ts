import {Component, OnDestroy} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {DataService} from '../services/data.service';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';
import {AuthProvider} from 'ngx-auth-firebaseui';
import {consoleTestResultHandler} from 'tslint/lib/test';

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
  private companyRef$;

  constructor(private router: Router, private data: DataService, private snackbar: MatSnackBar) {
    // check if user is authenticated
    this.data.afAuth.authState.subscribe(auth => {
      if (auth) {
        // check if local storage variables are defined
        if (this.data.company === undefined) {
          // set True Africa as defualt compaby
          this.setCompany(`companies/YbSudQRjCglvvffyujaf`);
        }

        // set global color
        // if (this.data.company === 'Planet Africa') {
        //   localStorage.setItem('logo', '../assets/logos/avatar-planetafrica.png');
        // } else {
        //   localStorage.setItem('logo', '../assets/logos/avatar-trueafrica.png');
        // }

        // set logged in user
        this.setUser(auth);

        // if user is logged in, redirect to dashboard
        this.router.navigate(['itineraries'])
          .then(() => {
            Swal.fire('Authentication', 'You are logged in!', 'success');
          });
      }
    });
  }

  // set company to local storage
  private setCompany(path) {
    this.companyRef$ = this.data.firestore.doc(path)
      .snapshotChanges()
      .subscribe(_ => {
        const company = _.payload.data();
        company[`key`] = _.payload.id;
        localStorage.setItem('company', JSON.stringify(company));
        localStorage.setItem('color', company[`color`]);
        localStorage.setItem('logo', company[`logoUrl`]);
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
  onLoginSuccess(auth) {
    // set company
    this.setCompany(`companies/YbSudQRjCglvvffyujaf`);

    // set logo
    this.logo = '../assets/logos/avatar-trueafrica.png';

    // set user
    this.setUser(auth);

    // show swal
    Swal.fire('Authentication', 'Log in successful!', 'success');
  }

  // sets user to local storage
  private setUser(auth) {
    this.user$ = this.data.firestore.doc('users/' + auth[`uid`])
      .snapshotChanges()
      .subscribe((_) => {
        const user = _.payload.data();
        user[`key`] = _.payload.id;
        // set logged in user
        localStorage.setItem('user', JSON.stringify(user));
      });
  }
}
