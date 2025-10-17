import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BridgeRatingComponent } from './bridge-rating.component';

describe('BridgeRatingComponent', () => {
  let component: BridgeRatingComponent;
  let fixture: ComponentFixture<BridgeRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BridgeRatingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BridgeRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
