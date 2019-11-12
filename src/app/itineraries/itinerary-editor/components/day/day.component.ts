import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DayEditorComponent} from '../../editors/day-editor/day-editor.component';
import Swal from 'sweetalert2';
import {DataService} from '../../../../services/data.service';
import {MatDialog} from '@angular/material';
import {MONTHS} from '../../../../model/months';

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.css']
})
export class DayComponent implements OnInit {
  @Input() day;
  @Input() comments;
  @Input() itineraryId;
  @Output() openDayEditor = new EventEmitter<any>();
  @Output() openCommentEditor = new EventEmitter<any>();
  @Output() deleteDay = new EventEmitter<any>();

  constructor(public data: DataService, public dialog: MatDialog) {
  }

  ngOnInit() {
  }

  removeDay(key) {
   // emit event
    this.deleteDay.emit(key);
  }

  // function to open dialog
  openDayDialog(day) {
  // emit event
    this.openDayEditor.emit(day);
  }

  // function to get itinerary descriptions from editor-components
  getItineraryDescriptions(day: any) {
    // string to store all itinerary item descriptions
    let itinerary = '';

    // check if any services were added to editor-components
    if (day.services !== undefined && day.services !== 'undefined') {
      if (day.services.length !== 0) {
        day.services.forEach(d => {
          // concat service
          itinerary += d.service.replace(/^[.\s]+|[.\s]+$/g, '') + '. ';
        });
      }
    }

    // check if any activities were added to editor-components
    if (day.activities !== undefined && day.activities !== 'undefined') {
      if (day.activities.length !== 0) {
        day.activities.forEach(d => {
          // concat activity
          itinerary += d.activity.replace(/^[.\s]+|[.\s]+$/g, '') + '. ';
        });
      }
    }

    // // check if any accommodation wa added to editor-components
    if (day.accommodation !== undefined && day.accommodation !== 'undefined') {
      if (day.accommodation.length !== 0) {

        day.accommodation.forEach(d => {
          // concat accommodation
          // console.log(d.accommodation)
          itinerary += d.description.replace(/^[.\s]+|[.\s]+$/g, '') + '. ';
        });
      }
    }
    return itinerary;
  }

  openCommentDialog(edit: string, comment: any) {
    this.openCommentEditor.emit(comment);
  }

  removeComment(key) {
    this.data.deleteObjectFromFirebase(`comments/${key}`, 'comment');
  }


  // function to get icon comment
  getCommentIcon(type: any) {
    let icon = '';

    switch (type) {
      case 'Activity':
        icon = '../../../../../assets/icons/comment-activity.svg';
        break;
      case 'Flight':
        icon = '../../../../../assets/icons/comment-flight.svg';
        break;
      case 'Info':
        icon = '../../../../../assets/icons/comment-info.svg';
        break;
      default:
        break;
    }

    return icon;
  }
}
