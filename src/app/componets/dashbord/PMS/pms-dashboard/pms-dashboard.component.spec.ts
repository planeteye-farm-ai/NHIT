import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmsDashboardComponent } from './pms-dashboard.component';

describe('PmsDashboardComponent', () => {
  let component: PmsDashboardComponent;
  let fixture: ComponentFixture<PmsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmsDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PmsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
