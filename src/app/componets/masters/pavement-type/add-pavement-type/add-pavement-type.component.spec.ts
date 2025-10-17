import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPavementTypeComponent } from './add-pavement-type.component';

describe('AddPavementTypeComponent', () => {
  let component: AddPavementTypeComponent;
  let fixture: ComponentFixture<AddPavementTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPavementTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPavementTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
