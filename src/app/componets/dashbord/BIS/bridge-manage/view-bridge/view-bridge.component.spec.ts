import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBridgeComponent } from './view-bridge.component';

describe('ViewBridgeComponent', () => {
  let component: ViewBridgeComponent;
  let fixture: ComponentFixture<ViewBridgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBridgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewBridgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
