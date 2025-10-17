import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaysideAmenitiesComponent } from './wayside-amenities.component';

describe('WaysideAmenitiesComponent', () => {
  let component: WaysideAmenitiesComponent;
  let fixture: ComponentFixture<WaysideAmenitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaysideAmenitiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaysideAmenitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
