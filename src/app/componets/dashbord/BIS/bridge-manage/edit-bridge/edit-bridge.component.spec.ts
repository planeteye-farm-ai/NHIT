import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBridgeComponent } from './edit-bridge.component';

describe('EditBridgeComponent', () => {
  let component: EditBridgeComponent;
  let fixture: ComponentFixture<EditBridgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBridgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditBridgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
