import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveUrlDialogComponent } from './live-url-dialog.component';

describe('LiveUrlDialogComponent', () => {
  let component: LiveUrlDialogComponent;
  let fixture: ComponentFixture<LiveUrlDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveUrlDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveUrlDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
