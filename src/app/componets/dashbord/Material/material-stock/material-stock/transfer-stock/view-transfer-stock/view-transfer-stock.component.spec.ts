import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTransferStockComponent } from './view-transfer-stock.component';

describe('ViewTransferStockComponent', () => {
  let component: ViewTransferStockComponent;
  let fixture: ComponentFixture<ViewTransferStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTransferStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewTransferStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
