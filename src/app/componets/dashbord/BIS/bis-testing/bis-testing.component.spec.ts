import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BisTestingComponent } from './bis-testing.component';

describe('BisTestingComponent', () => {
  let component: BisTestingComponent;
  let fixture: ComponentFixture<BisTestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BisTestingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BisTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
