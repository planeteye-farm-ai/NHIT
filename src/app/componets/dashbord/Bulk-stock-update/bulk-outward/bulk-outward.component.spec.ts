import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkOutwardComponent } from './bulk-outward.component';

describe('BulkOutwardComponent', () => {
  let component: BulkOutwardComponent;
  let fixture: ComponentFixture<BulkOutwardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkOutwardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BulkOutwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
