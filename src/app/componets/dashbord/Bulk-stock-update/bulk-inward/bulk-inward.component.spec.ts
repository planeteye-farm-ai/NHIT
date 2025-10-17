import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkInwardComponent } from './bulk-inward.component';

describe('BulkInwardComponent', () => {
  let component: BulkInwardComponent;
  let fixture: ComponentFixture<BulkInwardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkInwardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BulkInwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
