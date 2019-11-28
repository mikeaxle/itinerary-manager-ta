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
          // set True Africa as defualt company
          this.setCompany();
        }

        // set logged in user
        this.setUser(auth);

        // if (this.data.user) {
          // if user is logged in, redirect to dashboard
        this.router.navigate(['itineraries']);


      }
    });
  }

  // set company to local storage
   setCompany() {
        localStorage.setItem('company', JSON.stringify({
          color: '#B18C51',
          logoUrl: 'https://firebasestorage.googleapis.com/v0/b/true-africa-itinerary.appspot.com/o/avatar-trueafrica.png?alt=media&token=6808dc76-eecb-4bdd-beee-6fd2af2868dc',
          name: 'True Africa',
          prefix: 'TA',
          key: 'YbSudQRjCglvvffyujaf'
        }));
        localStorage.setItem('color', '#B18C51');
        localStorage.setItem('logo', 'https://firebasestorage.googleapis.com/v0/b/true-africa-itinerary.appspot.com/o/avatar-trueafrica.png?alt=media&token=6808dc76-eecb-4bdd-beee-6fd2af2868dc');
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
    this.setCompany();

    // set logo
    this.logo = '../assets/logos/avatar-trueafrica.png';

    // set user
    this.setUser(auth);

    // show swal
    // Swal.fire('Authentication', 'Log in successful!', 'success');
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
