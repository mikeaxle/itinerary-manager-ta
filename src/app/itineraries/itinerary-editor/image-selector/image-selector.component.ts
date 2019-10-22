import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-image-selector',
  styleUrls: ['./image-selector.component.css'],
  templateUrl: './image-selector.component.html'
})
export class ImageSelectorComponent implements OnInit {
  mediaList: any;
  tileBackground = '#add8e6';

  constructor(private data: DataService,
              public dialogRef: MatDialogRef<ImageSelectorComponent>,
              @Inject(MAT_DIALOG_DATA) public params: any) { }

  ngOnInit() {
    // get image list from firebase
    this.mediaList = this.data.af.list('media').valueChanges()
  }

  // function to close dialog
  onCloseConfirm(media) {

    this.dialogRef.close(media);
  }

  onCloseCancel() {
    this.dialogRef.close();
  }

}
