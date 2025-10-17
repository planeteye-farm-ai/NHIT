import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadInventoryComponent } from './road-inventory.component';

describe('RoadInventoryComponent', () => {
  let component: RoadInventoryComponent;
  let fixture: ComponentFixture<RoadInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoadInventoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoadInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
