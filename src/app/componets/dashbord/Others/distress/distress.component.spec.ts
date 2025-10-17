import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistressComponent } from './distress.component';

describe('DistressComponent', () => {
  let component: DistressComponent;
  let fixture: ComponentFixture<DistressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DistressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
