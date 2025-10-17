import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadSectionComponent } from './road-section.component';

describe('RoadSectionComponent', () => {
  let component: RoadSectionComponent;
  let fixture: ComponentFixture<RoadSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoadSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoadSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
