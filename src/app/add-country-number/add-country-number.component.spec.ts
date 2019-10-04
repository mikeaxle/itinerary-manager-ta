import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCountryNumberComponent } from './add-country-number.component';

describe('AddCountryNumberComponent', () => {
  let component: AddCountryNumberComponent;
  let fixture: ComponentFixture<AddCountryNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCountryNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCountryNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
