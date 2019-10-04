import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryDetailsEditorComponent } from './itinerary-details-editor.component';

describe('ItineraryDetailsEditorComponent', () => {
  let component: ItineraryDetailsEditorComponent;
  let fixture: ComponentFixture<ItineraryDetailsEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItineraryDetailsEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItineraryDetailsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
