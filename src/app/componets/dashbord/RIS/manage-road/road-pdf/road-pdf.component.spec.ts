import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadPdfComponent } from './road-pdf.component';

describe('RoadPdfComponent', () => {
  let component: RoadPdfComponent;
  let fixture: ComponentFixture<RoadPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoadPdfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoadPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
