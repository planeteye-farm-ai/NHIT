import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TisPdfComponent } from './tis-pdf.component';

describe('TisPdfComponent', () => {
  let component: TisPdfComponent;
  let fixture: ComponentFixture<TisPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TisPdfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TisPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
