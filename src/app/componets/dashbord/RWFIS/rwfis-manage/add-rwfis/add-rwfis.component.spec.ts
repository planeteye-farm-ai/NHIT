import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRwfisComponent } from './add-rwfis.component';

describe('AddRwfisComponent', () => {
  let component: AddRwfisComponent;
  let fixture: ComponentFixture<AddRwfisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRwfisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddRwfisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
