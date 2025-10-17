import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossSectionComponent } from './cross-section.component';

describe('CrossSectionComponent', () => {
  let component: CrossSectionComponent;
  let fixture: ComponentFixture<CrossSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrossSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
