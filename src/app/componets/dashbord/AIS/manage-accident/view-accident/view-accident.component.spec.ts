import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAccidentComponent } from './view-accident.component';

describe('ViewAccidentComponent', () => {
  let component: ViewAccidentComponent;
  let fixture: ComponentFixture<ViewAccidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAccidentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAccidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
