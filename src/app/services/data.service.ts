import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import 'rxjs-compat/add/observable/of';
import Swal from 'sweetalert2';
import {AngularFirestore} from '@angular/fire/firestore';
import {firestore} from 'firebase';


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
  constructor(public afAuth: AngularFireAuth, public firestore: AngularFirestore, private storage: AngularFireStorage, private router: Router) {}

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

    // remove double and single quotes from file name
    const imageName = this.getImageName(image);

    // init path
    const path = this.getFilePath(folder, imageName);

    // init ref
    const ref = this.storage.ref(path);

    const fileRef = this.storage.ref(path);

    // init task
    const task = ref.put(image);


    // observe percentage changes
    this.uploadPercent = task.percentageChanges();

    // todo: save data to item
    // get notified when the download URL is available
    return task.snapshotChanges().pipe(finalize(() => this.downloadURL = fileRef.getDownloadURL()));
  }

  // save object with image
  updateItemWithImage(id: string, folder: string, data: any, image: File, type: string) {
    // remove double and single quotes from file name
    const imageName = this.getImageName(image);

    // init path
    const path = this.getFilePath(folder, imageName);

    // init storage item reference
    const ref = this.storage.ref(path);

    // init file reference
    const fileRef = this.storage.ref(path);

    // init task
    const task = ref.put(image);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();

    // get notified when the download URL is available
    // todo: save data to item
    return task.snapshotChanges().pipe(finalize(() => this.downloadURL = fileRef.getDownloadURL()))
      .subscribe();
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
    if (this.company === 'Planet Africa') {
      localStorage.setItem('company', 'True Africa');
      localStorage.setItem('color', '#B18C51');
      localStorage.setItem('logo', '../assets/logos/avatar-trueafrica.png');
    } else if (this.company === 'True Africa') {
      localStorage.setItem('company', 'Planet Africa');
      localStorage.setItem('color', '#AC452F');
      localStorage.setItem('logo', '../assets/logos/avatar-planetafrica.png');
    }

    // navigate back to itinerary list
    this.router.navigate(['itineraries'])
      .then(() => {
        // reload page
        location.reload();
      });

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
    dataToSave[`created`] = firestore.Timestamp.now();
    this.firestore.collection(collection)
      .add(dataToSave)
      .then(_ => {
        console.log(`new ${caller} added`);
        Swal.fire(`${caller} editor`, `new ${caller} added.`, 'success');
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
        Swal.fire(`${type} editor`, `existing ${type} deleted.`, 'success');
      })
      .catch(err => {
        console.log(err);
        Swal.fire(`${type} editor`, err.message, 'error');
      });
  }

   updateFirebaseObject(path: any, dataToUpdate, caller: string) {
    // add updated time stamp
    dataToUpdate[`updated`] = firestore.Timestamp.now();
    this.firestore.doc(path)
      .update(dataToUpdate)
      .then(_ => {
        console.log(`updated ${caller}`);
        Swal.fire(`${caller} editor`, `${caller} updated.`, 'success');
      })
      .catch(err => {
        console.log(err);
        Swal.fire(`${caller} editor`, err.message, 'error');
      });
  }

}
