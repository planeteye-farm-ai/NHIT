import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFlexibleDistressComponent } from './add-flexible-distress.component';

describe('AddFlexibleDistressComponent', () => {
  let component: AddFlexibleDistressComponent;
  let fixture: ComponentFixture<AddFlexibleDistressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFlexibleDistressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddFlexibleDistressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
