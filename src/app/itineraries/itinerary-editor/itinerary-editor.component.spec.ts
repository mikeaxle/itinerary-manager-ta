import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryEditorComponent } from './itinerary-editor.component';

describe('ItineraryEditorComponent', () => {
  let component: ItineraryEditorComponent;
  let fixture: ComponentFixture<ItineraryEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItineraryEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItineraryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
