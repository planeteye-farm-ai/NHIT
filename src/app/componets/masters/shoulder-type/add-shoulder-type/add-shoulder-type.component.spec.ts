import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddShoulderTypeComponent } from './add-shoulder-type.component';

describe('AddShoulderTypeComponent', () => {
  let component: AddShoulderTypeComponent;
  let fixture: ComponentFixture<AddShoulderTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddShoulderTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddShoulderTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
