import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCarriagewayFurnitureComponent } from './edit-carriageway-furniture.component';

describe('EditCarriagewayFurnitureComponent', () => {
  let component: EditCarriagewayFurnitureComponent;
  let fixture: ComponentFixture<EditCarriagewayFurnitureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCarriagewayFurnitureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCarriagewayFurnitureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
