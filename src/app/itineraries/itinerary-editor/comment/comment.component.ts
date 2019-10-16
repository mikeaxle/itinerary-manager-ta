import {Component, Inject, OnInit} from '@angular/core';
import {inventoryTypes} from '../../../model/inventory-types';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { FormGroup } from '@angular/forms';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-comment',
  styleUrls: ['./comment.component.css'],
  templateUrl: './comment.component.html'

})
export class CommentComponent implements OnInit {
  days;
  mapIterator: any;
  commentForm: FormGroup;
  comment: Comment;
  types = inventoryTypes;

  constructor(public data: DataService,
              public dialogRef: MatDialogRef<CommentComponent>,
              @Inject(MAT_DIALOG_DATA) public params: any) { }

  ngOnInit() {
    // get comment from params
    this.comment = this.params.comment ? this.params.comment : new Comment();

    // map iterator made from keys
    this.days = [...this.params.days];
  }

  // function to close dialog
  onCloseConfirm() {
    // save to firebase comments list
    if (this.params.mode === 'add') {
      this.data.saveItem('comments/' + this.params.itineraryId, this.comment)
        .then(() => {
          // close dialog
          this.dialogRef.close();
        })
        .catch((error) => {
          console.log(error);
        });

    } else if (this.params.mode === 'edit') {
      this.data.updateItem(this.comment[`key`], 'comments/' + this.params.itineraryId, this.comment)
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

  // function check the form's validity
  isValid() {
    return this.comment[`type`] === '' || this.comment[`day`] === '' || this.comment[`comment`] === '';
  }

}
