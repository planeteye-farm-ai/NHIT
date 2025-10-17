import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadFurnituresComponent } from './road-furnitures.component';

describe('RoadFurnituresComponent', () => {
  let component: RoadFurnituresComponent;
  let fixture: ComponentFixture<RoadFurnituresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoadFurnituresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoadFurnituresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
