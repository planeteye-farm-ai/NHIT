import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwfisDashboardComponent } from './rwfis-dashboard.component';

describe('RwfisDashboardComponent', () => {
  let component: RwfisDashboardComponent;
  let fixture: ComponentFixture<RwfisDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwfisDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwfisDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
