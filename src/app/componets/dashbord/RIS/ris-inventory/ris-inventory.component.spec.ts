import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisInventoryComponent } from './ris-inventory.component';

describe('RisInventoryComponent', () => {
  let component: RisInventoryComponent;
  let fixture: ComponentFixture<RisInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RisInventoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RisInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
