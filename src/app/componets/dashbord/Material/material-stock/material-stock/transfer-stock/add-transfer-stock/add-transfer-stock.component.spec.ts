import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransferStockComponent } from './add-transfer-stock.component';

describe('AddTransferStockComponent', () => {
  let component: AddTransferStockComponent;
  let fixture: ComponentFixture<AddTransferStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTransferStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddTransferStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
