import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BisRepairComponent } from './bis-repair.component';

describe('BisRepairComponent', () => {
  let component: BisRepairComponent;
  let fixture: ComponentFixture<BisRepairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BisRepairComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BisRepairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
