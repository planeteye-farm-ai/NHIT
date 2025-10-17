import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFlexibleDistressComponent } from './view-flexible-distress.component';

describe('ViewFlexibleDistressComponent', () => {
  let component: ViewFlexibleDistressComponent;
  let fixture: ComponentFixture<ViewFlexibleDistressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFlexibleDistressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewFlexibleDistressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
