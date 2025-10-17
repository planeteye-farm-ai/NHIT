import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAccidentComponent } from './manage-accident.component';

describe('ManageAccidentComponent', () => {
  let component: ManageAccidentComponent;
  let fixture: ComponentFixture<ManageAccidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAccidentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageAccidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
