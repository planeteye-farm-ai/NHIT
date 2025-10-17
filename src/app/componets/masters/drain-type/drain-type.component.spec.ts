import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrainTypeComponent } from './drain-type.component';

describe('DrainTypeComponent', () => {
  let component: DrainTypeComponent;
  let fixture: ComponentFixture<DrainTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrainTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DrainTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
