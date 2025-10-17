import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddShoulderWidthComponent } from './add-shoulder-width.component';

describe('AddShoulderWidthComponent', () => {
  let component: AddShoulderWidthComponent;
  let fixture: ComponentFixture<AddShoulderWidthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddShoulderWidthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddShoulderWidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
