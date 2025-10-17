import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRigidDistressComponent } from './edit-rigid-distress.component';

describe('EditRigidDistressComponent', () => {
  let component: EditRigidDistressComponent;
  let fixture: ComponentFixture<EditRigidDistressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRigidDistressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditRigidDistressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
