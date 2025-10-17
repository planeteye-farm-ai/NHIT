import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PisDashboardComponent } from './pis-dashboard.component';

describe('PisDashboardComponent', () => {
  let component: PisDashboardComponent;
  let fixture: ComponentFixture<PisDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PisDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PisDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
