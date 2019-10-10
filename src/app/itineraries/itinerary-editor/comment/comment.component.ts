import {Component, Inject, OnInit} from '@angular/core';
import {inventoryTypes} from '../../../model/inventory-types';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-comment',
  styleUrls: ['./comment.component.css'],
  templateUrl: './comment.component.html'

})
export class CommentComponent implements OnInit {
  public commentForm: FormGroup;
  daysArray: any[] = [];
  mapIterator: any;
  comment: any;
  types = inventoryTypes;

  constructor(private formBuilder: FormBuilder,
              public data: DataService,
              public dialogRef: MatDialogRef<CommentComponent>,
              @Inject(MAT_DIALOG_DATA) public params: any) { }

  ngOnInit() {

    this.mapIterator = this.params.days.keys();
    // init days select array from parameters
    this.params.days.forEach(d => {
      this.daysArray.push({key: this.mapIterator.next().value, title: d});
    });

    if (this.params.mode === 'edit') {
      this.comment = this.params.comment;
    }

    // init comment form
    this.commentForm = this.initComment();
  }

  // function to init comment form
  initComment() {
    if (this.params.mode === 'add') {
      return this.formBuilder.group({
        day: [null, Validators.required],
        type: [null, Validators.required],
        comment: [null, Validators.required]
      });
    } else if (this.params.mode === 'edit') {
      return this.formBuilder.group({
        day: [this.comment.day, Validators.required],
        type: [this.comment.type, Validators.required],
        comment: [this.comment.comment, Validators.required]
      });
    }
  }

  // function to close dialog
  onCloseConfirm() {
    // save to firebase comments list
    if (this.params.mode === 'add') {
      this.data.saveItem('comments/' + this.params.itineraryId, this.commentForm.value)
        .then(() => {
          // close dialog
          this.dialogRef.close();
        })
        .catch((error) => {
          console.log(error);
        });

    } else if (this.params.mode === 'edit') {
      this.data.updateItem(this.comment.$key, 'comments/' + this.params.itineraryId, this.commentForm.value)
        .then(() => {
          this.dialogRef.close();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  // function to cancel dialog
  onCloseCancel() {
    this.dialogRef.close();
  }

}
