import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedianWidthComponent } from './median-width.component';

describe('MedianWidthComponent', () => {
  let component: MedianWidthComponent;
  let fixture: ComponentFixture<MedianWidthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedianWidthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MedianWidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
