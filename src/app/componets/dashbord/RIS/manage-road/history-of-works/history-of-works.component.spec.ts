import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryOfWorksComponent } from './history-of-works.component';

describe('HistoryOfWorksComponent', () => {
  let component: HistoryOfWorksComponent;
  let fixture: ComponentFixture<HistoryOfWorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryOfWorksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoryOfWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
