import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRoadFurnituresComponent } from './add-road-furnitures.component';

describe('AddRoadFurnituresComponent', () => {
  let component: AddRoadFurnituresComponent;
  let fixture: ComponentFixture<AddRoadFurnituresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRoadFurnituresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddRoadFurnituresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
