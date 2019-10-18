import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFireDatabase} from '@angular/fire/database';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireStorage} from '@angular/fire/storage';
import {finalize} from 'rxjs/operators';
import {Observable} from 'rxjs';
import 'rxjs-compat/add/observable/of';


@Injectable({
  providedIn: 'root',
})
export class DataService {
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  currentCompany: any;
  color: any;
  secondaryAppConfig = {
    apiKey: 'AIzaSyAQVDQYifHP_BT-xCtutLKRa8aI91e_Qmc',
    authDomain: 'true-africa-itinerary.firebaseapp.com',
    databaseURL: 'https://true-africa-itinerary.firebaseio.com'
  };
  secondaryApp: any;
  sampleData;
  constructor(public afAuth: AngularFireAuth, public af: AngularFireDatabase, private storage: AngularFireStorage, private router: Router) {
    this.currentCompany = localStorage.getItem('currentCompany');
    this.color = localStorage.getItem('color');
  }
  get user(): any {
    // parse user
    return JSON.parse(localStorage.getItem('user'));
  }

  // save object
  saveItem(type: string, data: any) {
    return this.af.list(type).push(data);
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

    // get notified when the download URL is available
    return task.snapshotChanges().pipe(finalize(() => this.downloadURL = fileRef.getDownloadURL()));
  }

  // get object
  getSingleItem(id: string, type: string) {
    return this.af.object(type + '/' + id);
  }

  // update object
  updateItem(id: string, type: string, data: any) {
    return this.af.object(`${type}/${id}`)
      .update(data);
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
    return task.snapshotChanges().pipe(finalize(() => this.downloadURL = fileRef.getDownloadURL()))
      .subscribe();
  }

  // delete object
  deleteItem(id: string, type: string) {
    return this.af.list(type).remove(id);
  }

  // delete object with image
  deleteItemWithImage(path: string) {
    return this.storage.storage.ref(path).delete();
  }

  // get list and return array with data and keys
  getList(type: string) {
    return this.af.list(type);
  }

  // create new user
  saveUser(data: any) {
    // create user with second firebase reference
    return this.secondaryApp.auth().createUserWithEmailAndPassword(data.email, data.password)
      .then((res) => {

        const role = {};
        role[`${res.uid}`] = true;

        // write role to firebase
        this.af.object('roles/' + data.role + '/users/')
          .update(role)
          .then(() => {
            this.af.object('users/' + res.uid).update({
              email: data.email,
              firstname: data.firstname,
              lastname: data.lastname,
              role: data.role,
            });
          });
      });
  }

  // authenticate user
  // authenticateUser() {
  //   return this.afAuth.authState
  //     .subscribe((auth) => {
  //       // check if logged in
  //       if (auth) {
  //         // return observable of user
  //         return this.af.object('users/' + auth[`uid`]);
  //       } else {
  //         // return observabke
  //         return Observable.of(!!auth);
  //       }
  //
  //     });
  // }

  // log user out
  logout() {
    return this.afAuth.auth.signOut();
  }

  // function to get button styles
  getButtonStyle() {
    if (this.currentCompany === 'Planet Africa') {
      return 'lesser-button-pa';
    } else if (this.currentCompany === 'True Africa') {
      return 'lesser-button-ta';
    }
  }
  getButtonStyleMain() {
    if (this.currentCompany === 'Planet Africa') {
      return 'greater-button-pa';
    } else if (this.currentCompany === 'True Africa') {
      return 'greater-button-ta';
    }
  }

  // function to switch between companies
  switchCompany() {
    if (this.currentCompany === 'Planet Africa') {
      localStorage.setItem('company', 'True Africa');
      localStorage.setItem('color', '#B18C51');
      localStorage.setItem('logo', '../assets/logos/avatar-trueafrica.png');
    } else if (this.currentCompany === 'True Africa') {
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
}
