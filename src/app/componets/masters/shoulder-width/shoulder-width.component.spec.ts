import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoulderWidthComponent } from './shoulder-width.component';

describe('ShoulderWidthComponent', () => {
  let component: ShoulderWidthComponent;
  let fixture: ComponentFixture<ShoulderWidthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoulderWidthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoulderWidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
