import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarriagewayFurnitureComponent } from './carriageway-furniture.component';

describe('CarriagewayFurnitureComponent', () => {
  let component: CarriagewayFurnitureComponent;
  let fixture: ComponentFixture<CarriagewayFurnitureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarriagewayFurnitureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CarriagewayFurnitureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
