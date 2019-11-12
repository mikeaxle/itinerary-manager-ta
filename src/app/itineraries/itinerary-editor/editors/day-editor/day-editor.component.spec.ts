import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayEditorComponent } from './day-editor.component';

describe('DayComponent', () => {
  let component: DayEditorComponent;
  let fixture: ComponentFixture<DayEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
