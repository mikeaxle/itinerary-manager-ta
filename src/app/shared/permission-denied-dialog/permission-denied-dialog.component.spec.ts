import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionDeniedDialogComponent } from './permission-denied-dialog.component';

describe('PermissionDeniedDialogComponent', () => {
  let component: PermissionDeniedDialogComponent;
  let fixture: ComponentFixture<PermissionDeniedDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermissionDeniedDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionDeniedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
