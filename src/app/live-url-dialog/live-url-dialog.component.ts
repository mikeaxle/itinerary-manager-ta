import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-live-url-dialog',
  templateUrl: './live-url-dialog.component.html',
  styleUrls: ['./live-url-dialog.component.css']
})
export class LiveUrlDialogComponent implements OnInit {
  image = '../../assets/pdf-icon.png';
  constructor(@Inject(MAT_DIALOG_DATA) public args: any) { }

  ngOnInit() {
  }

}
