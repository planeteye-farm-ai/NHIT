import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PavementWidthComponent } from './pavement-width.component';

describe('PavementWidthComponent', () => {
  let component: PavementWidthComponent;
  let fixture: ComponentFixture<PavementWidthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PavementWidthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PavementWidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
