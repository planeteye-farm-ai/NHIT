import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDistressComponent } from './add-distress.component';

describe('AddDistressComponent', () => {
  let component: AddDistressComponent;
  let fixture: ComponentFixture<AddDistressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDistressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDistressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
