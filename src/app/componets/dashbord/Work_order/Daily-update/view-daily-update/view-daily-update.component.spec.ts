import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDailyUpdateComponent } from './view-daily-update.component';

describe('ViewDailyUpdateComponent', () => {
  let component: ViewDailyUpdateComponent;
  let fixture: ComponentFixture<ViewDailyUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDailyUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDailyUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
