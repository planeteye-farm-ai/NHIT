import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BisHomeComponent } from './bis-home.component';

describe('BisHomeComponent', () => {
  let component: BisHomeComponent;
  let fixture: ComponentFixture<BisHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BisHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BisHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
