import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAccidentComponent } from './add-accident.component';

describe('AddAccidentComponent', () => {
  let component: AddAccidentComponent;
  let fixture: ComponentFixture<AddAccidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAccidentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddAccidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
