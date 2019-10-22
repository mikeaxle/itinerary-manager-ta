import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-image-selector',
  styleUrls: ['./image-selector.component.css'],
  templateUrl: './image-selector.component.html'
})
export class ImageSelectorComponent implements OnInit, OnDestroy {
  mediaList;
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
    this.mediaListSubscription$.unsubscribe()
  }

}
