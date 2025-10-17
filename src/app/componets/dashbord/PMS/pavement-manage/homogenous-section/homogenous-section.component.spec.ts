import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomogenousSectionComponent } from './homogenous-section.component';

describe('HomogenousSectionComponent', () => {
  let component: HomogenousSectionComponent;
  let fixture: ComponentFixture<HomogenousSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomogenousSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomogenousSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
