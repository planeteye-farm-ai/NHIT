import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCrossSectionComponent } from './add-cross-section.component';

describe('AddCrossSectionComponent', () => {
  let component: AddCrossSectionComponent;
  let fixture: ComponentFixture<AddCrossSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCrossSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCrossSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
