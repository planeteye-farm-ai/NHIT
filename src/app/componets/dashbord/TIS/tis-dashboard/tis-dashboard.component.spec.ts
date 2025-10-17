import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TisDashboardComponent } from './tis-dashboard.component';

describe('TisDashboardComponent', () => {
  let component: TisDashboardComponent;
  let fixture: ComponentFixture<TisDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TisDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TisDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
