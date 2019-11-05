import {Component, Inject, OnInit} from '@angular/core';
import {inventoryTypes} from '../../../../model/inventory-types';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { FormGroup } from '@angular/forms';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-comment',
  styleUrls: ['./comment-editor.component.css'],
  templateUrl: './comment-editor.component.html'

})
export class CommentEditorComponent implements OnInit {
  days;
  mapIterator: any;
  commentForm: FormGroup;
  comment: any;
  types = [
    'Flight',
    'Activity',
    'Info'
  ];
  day: any;

  constructor(public data: DataService,
              public dialogRef: MatDialogRef<CommentEditorComponent>,
              @Inject(MAT_DIALOG_DATA) public params: any) { }

  ngOnInit() {
    // get comment-editor from params
    this.comment = this.params.comment ? this.params.comment : {};

    this.day = this.comment.day ? this.params.comment.day.id : null;



    // map iterator made from keys
    this.days = [...this.params.days];
  }

  onSelect() {
    this.comment.day = this.data.firestore.doc(`days/${this.day}`).ref;
  }

  // function to close dialog
  onCloseConfirm() {
    this.dialogRef.close(this.comment);
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
