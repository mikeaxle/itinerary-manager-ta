import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-pdf-dialog',
  styleUrls: ['./pdf-dialog.component.css'],
  templateUrl: './pdf-dialog.component.html'

})
export class PdfDialogComponent implements OnInit {
  image = '../../assets/pdf-icon.png';
  color = localStorage.getItem('color');

  constructor(@Inject(MAT_DIALOG_DATA) public args: any) { }

  ngOnInit() {
  }

}
