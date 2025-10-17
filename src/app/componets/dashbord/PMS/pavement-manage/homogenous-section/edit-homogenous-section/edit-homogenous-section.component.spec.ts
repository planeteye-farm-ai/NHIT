import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHomogenousSectionComponent } from './edit-homogenous-section.component';

describe('EditHomogenousSectionComponent', () => {
  let component: EditHomogenousSectionComponent;
  let fixture: ComponentFixture<EditHomogenousSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditHomogenousSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditHomogenousSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
