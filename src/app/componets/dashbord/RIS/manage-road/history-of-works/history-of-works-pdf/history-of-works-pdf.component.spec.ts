import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryOfWorksPdfComponent } from './history-of-works-pdf.component';

describe('HistoryOfWorksPdfComponent', () => {
  let component: HistoryOfWorksPdfComponent;
  let fixture: ComponentFixture<HistoryOfWorksPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryOfWorksPdfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoryOfWorksPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
