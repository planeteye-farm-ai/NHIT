import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHomogenousSectionComponent } from './add-homogenous-section.component';

describe('AddHomogenousSectionComponent', () => {
  let component: AddHomogenousSectionComponent;
  let fixture: ComponentFixture<AddHomogenousSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddHomogenousSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddHomogenousSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
