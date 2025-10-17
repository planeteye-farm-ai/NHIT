
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistressPredictionDashboardComponent } from './distress-prediction-dashboard.component';

describe('DistressPredictionDashboardComponent', () => {
  let component: DistressPredictionDashboardComponent;
  let fixture: ComponentFixture<DistressPredictionDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistressPredictionDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistressPredictionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

