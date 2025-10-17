import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficFileComponent } from './traffic-file.component';

describe('TrafficFileComponent', () => {
  let component: TrafficFileComponent;
  let fixture: ComponentFixture<TrafficFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrafficFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
