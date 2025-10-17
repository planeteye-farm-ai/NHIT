import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWaysideAmenitiesComponent } from './add-wayside-amenities.component';

describe('AddWaysideAmenitiesComponent', () => {
  let component: AddWaysideAmenitiesComponent;
  let fixture: ComponentFixture<AddWaysideAmenitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWaysideAmenitiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddWaysideAmenitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
