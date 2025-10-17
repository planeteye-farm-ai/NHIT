import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AisDashboardComponent } from './ais-dashboard.component';

describe('AisDashboardComponent', () => {
  let component: AisDashboardComponent;
  let fixture: ComponentFixture<AisDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AisDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AisDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
