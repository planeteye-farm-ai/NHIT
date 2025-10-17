import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistressPredictionReportComponent } from './distress-prediction-report.component';

describe('DistressPredictionReportComponent', () => {
  let component: DistressPredictionReportComponent;
  let fixture: ComponentFixture<DistressPredictionReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistressPredictionReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DistressPredictionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
