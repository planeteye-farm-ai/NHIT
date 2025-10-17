import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexibleDistressComponent } from './flexible-distress.component';

describe('FlexibleDistressComponent', () => {
  let component: FlexibleDistressComponent;
  let fixture: ComponentFixture<FlexibleDistressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexibleDistressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FlexibleDistressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
