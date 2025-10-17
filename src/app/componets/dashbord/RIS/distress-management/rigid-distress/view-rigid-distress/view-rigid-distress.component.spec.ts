import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRigidDistressComponent } from './view-rigid-distress.component';

describe('ViewRigidDistressComponent', () => {
  let component: ViewRigidDistressComponent;
  let fixture: ComponentFixture<ViewRigidDistressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRigidDistressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRigidDistressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
