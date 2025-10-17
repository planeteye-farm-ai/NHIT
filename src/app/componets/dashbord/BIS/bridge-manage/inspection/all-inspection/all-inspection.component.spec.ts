import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllInspectionComponent } from './all-inspection.component';

describe('AllInspectionComponent', () => {
  let component: AllInspectionComponent;
  let fixture: ComponentFixture<AllInspectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllInspectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
