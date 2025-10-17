import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBridgeComponent } from './add-bridge.component';

describe('AddBridgeComponent', () => {
  let component: AddBridgeComponent;
  let fixture: ComponentFixture<AddBridgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBridgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddBridgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
