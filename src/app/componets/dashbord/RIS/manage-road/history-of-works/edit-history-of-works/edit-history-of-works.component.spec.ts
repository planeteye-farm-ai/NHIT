import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHistoryOfWorksComponent } from './edit-history-of-works.component';

describe('EditHistoryOfWorksComponent', () => {
  let component: EditHistoryOfWorksComponent;
  let fixture: ComponentFixture<EditHistoryOfWorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditHistoryOfWorksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditHistoryOfWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
