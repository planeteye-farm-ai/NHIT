import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RigidDistressComponent } from './rigid-distress.component';

describe('RigidDistressComponent', () => {
  let component: RigidDistressComponent;
  let fixture: ComponentFixture<RigidDistressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RigidDistressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RigidDistressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
