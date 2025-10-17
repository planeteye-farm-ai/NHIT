import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHomogenousSectionComponent } from './view-homogenous-section.component';

describe('ViewHomogenousSectionComponent', () => {
  let component: ViewHomogenousSectionComponent;
  let fixture: ComponentFixture<ViewHomogenousSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewHomogenousSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewHomogenousSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
