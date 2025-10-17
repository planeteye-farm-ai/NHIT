import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialStockComponent } from './material-stock.component';

describe('MaterialStockComponent', () => {
  let component: MaterialStockComponent;
  let fixture: ComponentFixture<MaterialStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MaterialStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
