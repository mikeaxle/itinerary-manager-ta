import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfDialogComponent } from './pdf-dialog.component';
import {MAT_DIALOG_DATA} from '@angular/material';

describe('PdfDialogComponent', () => {
  let component: PdfDialogComponent;
  let fixture: ComponentFixture<PdfDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdfDialogComponent ],
      // providers: [
      //   { provide: MAT_DIALOG_DATA }
      //   ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
