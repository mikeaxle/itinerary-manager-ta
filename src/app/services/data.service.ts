import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import 'rxjs-compat/add/observable/of';
import Swal from 'sweetalert2';
import {AngularFirestore} from '@angular/fire/firestore';
import * as firebase from 'firebase';
import {MatSnackBar} from '@angular/material';


@Injectable({
  providedIn: 'root',
})
export class DataService {
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  secondaryAppConfig = {
    apiKey: 'AIzaSyAQVDQYifHP_BT-xCtutLKRa8aI91e_Qmc',
    authDomain: 'true-africa-itinerary.firebaseapp.com',
    databaseURL: 'https://true-africa-itinerary.firebaseio.com'
  };
  secondaryApp: any;
  constructor(public afAuth: AngularFireAuth, public database: AngularFireDatabase, public firestore: AngularFirestore,
              public storage: AngularFireStorage, private router: Router, public snackBar: MatSnackBar) {}

  // getter for user
  get user(): any {
    return JSON.parse(localStorage.getItem('user'));
  }

  // getter for color
  get color(): any {
    return localStorage.getItem('color');
  }

  // getter for company
  get company(): any {
    return JSON.parse(localStorage.getItem('company'));
  }

  // getter for logo
  get logo(): any {
    return localStorage.getItem('logo');
  }


  // save object with image
  saveItemWithImage(folder: string, data: any, image: File, type: string) {
    // show info swal
    Swal.fire(`${type} editor`, `adding new ${type}...`, 'info');

    // remove double and single quotes from file name
    const imageName = image.name.replace(/["']/g, '');

    // create path
    const path = `/${folder}/${imageName}`;
    const iRef = this.storage.ref(path);


    // resize image


    // save file
    iRef.put(image)
      .then((snapshot) => {

        // set image url
        data.image = path;

        iRef.getDownloadURL()
          .toPromise()
          .then(url => {
            // close swal
            Swal.close();

            // get image download url
            data[`imageUrl`] = url;

            // save to firebase
            this.saveFirebaseObject('media', data, 'media');

          })
          .catch(err => {
            Swal.close();
            console.log(err);
            Swal.fire(`${type} editor`, err.message, 'error');
          });
      })
      .catch(errorNo => {
        console.log(errorNo);
        Swal.close();
        Swal.fire(`${type} editor`, errorNo.message, 'error');
      });
  }

  // save object with image
  updateItemWithImage(id: string, folder: string, data: any, image: File, type: string) {
    // show info swal
    Swal.fire(`${type} editor`, `adding new ${type}...`, 'info');

    // remove double and single quotes from file name
    const imageName = this.getImageName(image);

    // init path
    const path = this.getFilePath(folder, imageName);

    // init storage item reference
    const ref = this.storage.ref(path);

    // init task
    // save file
    ref.put(image)
      .then((snapshot) => {

        // set image url
        data.image = path;

        ref.getDownloadURL()
          .toPromise()
          .then(url => {
            // close swal
            Swal.close();

            // get image download url
            data[`imageUrl`] = url;

            // save to firebase
            this.updateFirebaseObject(`media/${id}`, data, 'media', true);
            // this.saveFirebaseObject('media', data, 'media');

          })
          .catch(err => {
            Swal.close();
            console.log(err);
            Swal.fire(`${type} editor`, err.message, 'error');
          });
      })
      .catch(errorNo => {
        console.log(errorNo);
        Swal.close();
        Swal.fire(`${type} editor`, errorNo.message, 'error');
      });
  }


  // delete object with image
  deleteItemWithImage(path: string) {
    return this.storage.storage.ref(path).delete();
  }

  // create new user
  saveUser(data: any) {
    // create user with second firebase reference
    return this.secondaryApp.auth().createUserWithEmailAndPassword(data.email, data.password)
      .then(_ => {

        this.firestore.doc(`users/${_[`uid`]}`)
          .set({
           email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role
          })
          .then(res => {
            console.log('new user added: ' + JSON.stringify(res));
          })
          .catch(err => {
            console.error(err);
          });
      });
  }

  // log user out
  logout() {
    return this.afAuth.auth.signOut();
  }

  // function to get button styles
  getButtonStyle() {
    if (this.company === 'Planet Africa') {
      return 'lesser-button-pa';
    } else if (this.company === 'True Africa') {
      return 'lesser-button-ta';
    }
  }
  getButtonStyleMain() {
    if (this.company === 'Planet Africa') {
      return 'greater-button-pa';
    } else if (this.company === 'True Africa') {
      return 'greater-button-ta';
    }
  }

  // function to switch between companies
  switchCompany() {

    if (this.company.name === 'Planet Africa') {
      // set planet africa
      this.firestore.doc(`companies/YbSudQRjCglvvffyujaf`).snapshotChanges()
        .subscribe(_ => {
          // console.log({..._.payload.data(), key: _.payload.id })
          localStorage.setItem('company', JSON.stringify({..._.payload.data(), key: _.payload.id }));
          localStorage.setItem('color', '#B18C51');
          localStorage.setItem('logo', '../assets/logos/avatar-trueafrica.png');

          // navigate back to itinerary list
          this.router.navigate(['login'])
            .then(() => {
              // reload page
              location.reload();
            });
        });

    } else if (this.company.name === 'True Africa') {
      // set planet africa
      this.firestore.doc(`companies/9MZBVwEmR28enTGLIi1p`).snapshotChanges()
        .subscribe(_ => {
          // console.log({..._.payload.data(), key: _.payload.id })
          localStorage.setItem('company', JSON.stringify({..._.payload.data(), key: _.payload.id }));
          localStorage.setItem('color', '#AC452F');
          localStorage.setItem('logo', '../assets/logos/avatar-planetafrica.png');

          // navigate back to itinerary list
          this.router.navigate(['login'])
            .then(() => {
              // reload page
              location.reload();
            });
        });
    }



  }

  //  function to generate image name
  getImageName(image: any): string {
    return image.name.replace(/["']/g, '');
  }

  // function to get file path
  getFilePath(folder: string, imageName: string): string {
    return `/${folder}/${imageName}`;
  }



  saveFirebaseObject(collection: any, dataToSave, caller: string) {
    // add created time stamp
    dataToSave[`created`] = firebase.firestore.Timestamp.now();
    this.firestore.collection(collection)
      .add(dataToSave)
      .then(_ => {
        console.log(`new ${caller} added`);
        this.snackBar.open(`${caller} added`, 'success', {
          duration: 2000
        });
      })
      .catch(err => {
        console.log(err);
        Swal.fire(`${caller} editor`, err.message, 'error');
      });
  }

  // function to delete firebase objects
   deleteObjectFromFirebase(path: string, type: string) {
    this.firestore.doc(path)
      .delete()
      .then(_ => {
        console.log(`${type} deleted.`);
        this.snackBar.open(`existing ${type} deleted.`, 'success', {
          duration: 2000
        });
      })
      .catch(err => {
        console.log(err);
        Swal.fire(`${type} editor`, err.message, 'error');
      });
  }

   updateFirebaseObject(path: any, dataToUpdate, caller: string, notify?) {
    // add updated time stamp
    dataToUpdate[`updated`] = firebase.firestore.Timestamp.now();
    this.firestore.doc(path)
      .update(dataToUpdate)
      .then(_ => {
        notify ? this.snackBar.open(`${caller} updated.`, 'success', { duration: 2000 }) :  console.log(`updated ${caller}`);
      })
      .catch(err => {
        console.log(err);
        Swal.fire(`${caller} editor`, err.message, 'error');
      });
  }

   async saveImage(image: any) {
    const imageRef$ = this.storage.ref('inventory-images/' + image.name.trim());
    await imageRef$.put(image);
    return  imageRef$.getDownloadURL();
  }
}
