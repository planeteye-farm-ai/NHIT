import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMedianWidthComponent } from './add-median-width.component';

describe('AddMedianWidthComponent', () => {
  let component: AddMedianWidthComponent;
  let fixture: ComponentFixture<AddMedianWidthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMedianWidthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMedianWidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
