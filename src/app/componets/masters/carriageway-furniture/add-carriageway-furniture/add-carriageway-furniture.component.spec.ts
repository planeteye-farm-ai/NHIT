import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCarriagewayFurnitureComponent } from './add-carriageway-furniture.component';

describe('AddCarriagewayFurnitureComponent', () => {
  let component: AddCarriagewayFurnitureComponent;
  let fixture: ComponentFixture<AddCarriagewayFurnitureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCarriagewayFurnitureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCarriagewayFurnitureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
