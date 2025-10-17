import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BisDashboardComponent } from './bis-dashboard.component';

describe('BisDashboardComponent', () => {
  let component: BisDashboardComponent;
  let fixture: ComponentFixture<BisDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BisDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BisDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
