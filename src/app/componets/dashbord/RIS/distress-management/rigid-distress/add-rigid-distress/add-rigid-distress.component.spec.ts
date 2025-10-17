import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRigidDistressComponent } from './add-rigid-distress.component';

describe('AddRigidDistressComponent', () => {
  let component: AddRigidDistressComponent;
  let fixture: ComponentFixture<AddRigidDistressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRigidDistressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddRigidDistressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
