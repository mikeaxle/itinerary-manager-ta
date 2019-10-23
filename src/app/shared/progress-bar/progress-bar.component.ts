import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  styleUrls: ['./progress-bar.component.css'],
  templateUrl: './progress-bar.component.html'
})
export class ProgressBarComponent implements OnInit {
@Input() listLength: number;

  constructor() { }

  ngOnInit() {
  }

}
