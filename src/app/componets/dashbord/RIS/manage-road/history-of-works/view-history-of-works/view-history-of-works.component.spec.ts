import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHistoryOfWorksComponent } from './view-history-of-works.component';

describe('ViewHistoryOfWorksComponent', () => {
  let component: ViewHistoryOfWorksComponent;
  let fixture: ComponentFixture<ViewHistoryOfWorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewHistoryOfWorksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewHistoryOfWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
