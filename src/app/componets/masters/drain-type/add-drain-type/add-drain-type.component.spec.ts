import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDrainTypeComponent } from './add-drain-type.component';

describe('AddDrainTypeComponent', () => {
  let component: AddDrainTypeComponent;
  let fixture: ComponentFixture<AddDrainTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDrainTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDrainTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
