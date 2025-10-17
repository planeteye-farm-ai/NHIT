import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficFilePdfComponent } from './traffic-file-pdf.component';

describe('TrafficFilePdfComponent', () => {
  let component: TrafficFilePdfComponent;
  let fixture: ComponentFixture<TrafficFilePdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficFilePdfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrafficFilePdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
