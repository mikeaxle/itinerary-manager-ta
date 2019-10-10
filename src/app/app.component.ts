import {Component, Injectable, OnInit} from '@angular/core';
import {DataService} from './services/data.service';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';

@Injectable()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
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

    // get logo
    this.data.af.object(`companies/${this.data.currentCompany}`)
      .valueChanges()
    .subscribe((res) => {
      if (res) {
      // check if planet africa is logged in
      // @ts-ignore
      if (res['name'] === 'Planet Africa') {
        this.isPlanetAfrica = true;
        this.logo = 'https://firebasestorage.googleapis.com/v0/b/true-africa-itinerary.appspot.com/o/avatar-planetafrica.png?alt=media&token=a237a250-8317-4568-baed-9cef0f27f5bc';
      } else {
        this.isPlanetAfrica = false;
        this.logo = 'https://firebasestorage.googleapis.com/v0/b/true-africa-itinerary.appspot.com/o/avatar-trueafrica.png?alt=media&token=6808dc76-eecb-4bdd-beee-6fd2af2868dc';
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
