import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatBottomSheet, MatDialog} from '@angular/material';
import {DataService} from '../services/data.service';
import {ConfirmComponent} from '../shared/confirm/confirm.component';
import Swal from 'sweetalert2';
import {EditorComponent} from '../shared/editor/editor.component';

@Component({
  selector: 'app-media',
  styleUrls: ['./media.component.css'],
  templateUrl: './media.component.html'
})
export class MediaComponent implements OnInit, OnDestroy {

  mediaList = [];
  MEDIA_LIST = [];
  error: any;
  tileBackground = '#add8e6';
  page = 0;
  size = 15;
  ref;

  constructor(private data: DataService, public dialog: MatDialog) { }

  ngOnInit() {
    // get media list

     this.ref = this.data.af.list('media')
      .snapshotChanges()
      .subscribe((snapshots) => {
        // iterate snapshots
        snapshots.forEach(snapshot => {
          // get media item
          const mediaItem = snapshot.payload.val();

          // get key
          mediaItem[`$key`] = snapshot.key;

          // push to media list array
          this.mediaList.push(mediaItem);
        });

        // copy array
        this.MEDIA_LIST = [...this.mediaList]; // .slice(this.mediaList.length - 15);

        // set pagination size
        this.size = this.mediaList.length;
      });

     // init pagination
     this.getData({pageIndex: this.page, pageSize: this.size});
  }

  // function to create pagination
  getData(obj) {
    let index = 0;
    const startingIndex = obj.pageIndex * obj.pageSize;
    const endingIndex = startingIndex + obj.pageSize;

    this.MEDIA_LIST = this.mediaList.filter(() => {
      index++;
      return (index > startingIndex && index <= endingIndex);
    });
  }

  // function to open confirm delete dialog
  openDelete(media) {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '480px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        // if result is true
        if (result) {
          this.deleteMedia(media);
        }
      }
    });
  }

  // function to delete media
  deleteMedia(media) {
    this.data.deleteItem(media.$key, 'media')
      .then(() => {
        console.log('media deleted');

        // delete image from firebase storage
        this.data.deleteItemWithImage(media.image)
          .then(res => {
            Swal.fire('Success', 'Inventory item deleted: ' + JSON.stringify(res), 'success');
            console.log(res);
          });
      })
      .catch((error) => {
        Swal.fire('Failed', error.message, 'error');
        this.error = error;
      });
  }

  // function to add media
  addNew() {
    this.dialog.open(EditorComponent, {
      data: {
        item: null,
        new: true,
        type: 'media'
      }
    });
  }

  // function to edit media
  editMediaItem(media: any) {
    this.dialog.open(EditorComponent, {
      data: {
        item: media,
        new: false,
        type: 'media'
      }
    });
  }

  ngOnDestroy(): void {
    this.ref.unsubscribe();
  }

  applyFilter(value) {
    const temp = [];
    // iterate entire media list
    this.mediaList.forEach(media => {
      // search title for occurances of value
      if (media.title.search(value) !== -1) {
        // push to temp array
        temp.push(media);
      }
    });

  //  check if temp array has entries
    if (temp.length > 0) {
      this.MEDIA_LIST = temp;
      this.page = 1;
    }
  }


}
