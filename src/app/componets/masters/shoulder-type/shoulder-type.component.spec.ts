import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoulderTypeComponent } from './shoulder-type.component';

describe('ShoulderTypeComponent', () => {
  let component: ShoulderTypeComponent;
  let fixture: ComponentFixture<ShoulderTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoulderTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoulderTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
