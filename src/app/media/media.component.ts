import { Component, OnInit } from '@angular/core';
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
export class MediaComponent implements OnInit {
  mediaList = [];
  MEDIA_LIST = [];
  error: any;
  tileBackground = '#add8e6';
  private page = 0;
  private size = 15;

  constructor(private data: DataService, public dialog: MatDialog, public bottomSheet: MatBottomSheet) { }

  ngOnInit() {
    // get media list

     this.data.af.list('media')
      .snapshotChanges()
      .subscribe((res) => {
        this.mediaList = res;
        this.MEDIA_LIST = [...this.mediaList] // .slice(this.mediaList.length - 15);
        this.size = this.mediaList.length;
      });

     // itint pagination
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
          .subscribe(res => {
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
    this.bottomSheet.open(EditorComponent);
  }

  // function to edit media
  editMediaItem(media: any) {
    this.bottomSheet.open(EditorComponent);
  }
}
