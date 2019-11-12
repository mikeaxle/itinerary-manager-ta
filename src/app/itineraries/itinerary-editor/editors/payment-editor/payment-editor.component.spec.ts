import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentEditorComponent } from './payment-editor.component';

describe('PaymentComponent', () => {
  let component: PaymentEditorComponent;
  let fixture: ComponentFixture<PaymentEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
