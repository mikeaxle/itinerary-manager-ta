import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-permission-denied-dialog',
  styleUrls: ['./permission-denied-dialog.component.css'],
  templateUrl: './permission-denied-dialog.component.html'
})
export class PermissionDeniedDialogComponent implements OnInit {

  color: any;
  message: any;
  constructor(public dialogReference: MatDialogRef<PermissionDeniedDialogComponent>, @Inject(MAT_DIALOG_DATA) public params: any, public data: DataService) {

  }

  ngOnInit() {
    this.color = localStorage.getItem('color');
    this.message = this.params;
  }

  // function to close dialog
  onCloseConfirm() {
    this.dialogReference.close(true);
  }

  // function to cancel dialog
  onCloseCancel() {
    this.dialogReference.close(false);
  }

}
