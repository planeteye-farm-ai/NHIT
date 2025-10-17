import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTransferStockComponent } from './edit-transfer-stock.component';

describe('EditTransferStockComponent', () => {
  let component: EditTransferStockComponent;
  let fixture: ComponentFixture<EditTransferStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTransferStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditTransferStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
