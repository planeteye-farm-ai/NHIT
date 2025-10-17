import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHistoryOfWorksComponent } from './add-history-of-works.component';

describe('AddHistoryOfWorksComponent', () => {
  let component: AddHistoryOfWorksComponent;
  let fixture: ComponentFixture<AddHistoryOfWorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddHistoryOfWorksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddHistoryOfWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
