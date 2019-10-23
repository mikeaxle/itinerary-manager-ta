import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-image-selector',
  styleUrls: ['./image-selector.component.css'],
  templateUrl: './image-selector.component.html'
})
export class ImageSelectorComponent implements OnInit, OnDestroy {
  mediaList = [];
  MEDIA_LIST = [];
  tileBackground = '#add8e6';
  private mediaListSubscription$;

  constructor(private data: DataService,
              private dialogRef: MatDialogRef<ImageSelectorComponent>,
              @Inject(MAT_DIALOG_DATA) public params: any) { }

  ngOnInit() {
    // get image list from firebase
    this.mediaListSubscription$ = this.data.af.list('media').valueChanges()
      .subscribe(_ => {
        this.mediaList = _;
        this.MEDIA_LIST =  this.mediaList;
      });
  }

  // function to close dialog
  onCloseConfirm(media) {

    this.dialogRef.close(media);
  }

  onCloseCancel() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.mediaListSubscription$.unsubscribe();
  }

  applyFilter(value: any) {
    // if (value === '') {
    //   this.MEDIA_LIST = this.mediaList;
    // }
    const temp = [];
    // iterate entire media list
    this.mediaList.forEach(media => {
      // search title for occurances of value
      if (media.title.search(value) !== -1) {
        // push to temp array
        temp.push(media);
      }
    });

    // //  check if temp array has entries
    if (temp.length > 0) {
      this.MEDIA_LIST = temp;
      // this.page = 1;
    }
  }
}
