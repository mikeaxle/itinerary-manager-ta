import { Component } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-confirm',
  styleUrls: ['./confirm.component.css'],
  templateUrl: './confirm.component.html'
})
export class ConfirmComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmComponent>, public data: DataService) { }

  // function to close dialog
  onCloseConfirm() {
    this.dialogRef.close(true);
  }

  // function to cancel dialog
  onCloseCancel() {
    this.dialogRef.close(false);
  }

}
