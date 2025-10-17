import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisReportedDashboardComponent } from './ris-reported-dashboard.component';

describe('RisReportedDashboardComponent', () => {
  let component: RisReportedDashboardComponent;
  let fixture: ComponentFixture<RisReportedDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RisReportedDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RisReportedDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
