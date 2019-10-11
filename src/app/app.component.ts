import {Component, Injectable, OnInit} from '@angular/core';
import {DataService} from './services/data.service';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';


@Injectable()
@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'itinerary-manager-ta';
  user: any;
  isPlanetAfrica = false;
  logo: any;

  constructor(public data: DataService, private snackbar: MatSnackBar, private router: Router) {}

  ngOnInit() {
    // check if user is logged in
    this.user = this.data.authenticateUser();

    console.assert(this.user, 'user object');

    // get logo
    this.data.af.object(`companies/${this.data.currentCompany}`)
      .valueChanges()
    .subscribe((res) => {
      if (res) {
      // check if planet africa is logged in
      // @ts-ignore
      if (res[`name`] === 'Planet Africa') {
        this.isPlanetAfrica = true;
        this.logo = '';
      } else {
        this.isPlanetAfrica = false;
        this.logo = '../assets/logos/avatar-trueafrica.png';
      }
      }
    })
      .unsubscribe();
  }

  // function to logout
  logout() {
    // logout from firebase
    this.data.afAuth.auth.signOut().then(() => {
      // navigate to root
      this.router.navigate([''])
        .then(() => {
          // remove session variables
          localStorage.clear();
          this.data.currentCompany = null;
          this.data.color = null;

          // show snack bar
          this.snackbar.open('You have logged out successfully', 'CLOSE', {
            duration: 3000,
          });

        });

    });
  }


}
