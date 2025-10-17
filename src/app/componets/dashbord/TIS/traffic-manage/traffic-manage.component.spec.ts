import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficManageComponent } from './traffic-manage.component';

describe('TrafficManageComponent', () => {
  let component: TrafficManageComponent;
  let fixture: ComponentFixture<TrafficManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficManageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrafficManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
