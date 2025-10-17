import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopographyComponent } from './topography.component';

describe('TopographyComponent', () => {
  let component: TopographyComponent;
  let fixture: ComponentFixture<TopographyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopographyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TopographyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
