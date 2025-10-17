import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadInventoryPdfComponent } from './road-inventory-pdf.component';

describe('RoadInventoryPdfComponent', () => {
  let component: RoadInventoryPdfComponent;
  let fixture: ComponentFixture<RoadInventoryPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoadInventoryPdfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoadInventoryPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
