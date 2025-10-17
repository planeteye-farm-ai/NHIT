import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPavementWidthComponent } from './add-pavement-width.component';

describe('AddPavementWidthComponent', () => {
  let component: AddPavementWidthComponent;
  let fixture: ComponentFixture<AddPavementWidthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPavementWidthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPavementWidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
