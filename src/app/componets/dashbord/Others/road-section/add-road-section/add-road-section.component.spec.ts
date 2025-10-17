import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRoadSectionComponent } from './add-road-section.component';

describe('AddRoadSectionComponent', () => {
  let component: AddRoadSectionComponent;
  let fixture: ComponentFixture<AddRoadSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRoadSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddRoadSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
