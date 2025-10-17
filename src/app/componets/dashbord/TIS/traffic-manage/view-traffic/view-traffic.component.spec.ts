import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTrafficComponent } from './view-traffic.component';

describe('ViewTrafficComponent', () => {
  let component: ViewTrafficComponent;
  let fixture: ComponentFixture<ViewTrafficComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTrafficComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewTrafficComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
