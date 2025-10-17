import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistressReportedReportComponent } from './distress-reported-report.component';

describe('DistressReportedReportComponent', () => {
  let component: DistressReportedReportComponent;
  let fixture: ComponentFixture<DistressReportedReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistressReportedReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DistressReportedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
