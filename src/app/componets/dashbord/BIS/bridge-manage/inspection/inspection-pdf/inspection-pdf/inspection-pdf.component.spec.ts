import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionPdfComponent } from './inspection-pdf.component';

describe('InspectionPdfComponent', () => {
  let component: InspectionPdfComponent;
  let fixture: ComponentFixture<InspectionPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectionPdfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InspectionPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
