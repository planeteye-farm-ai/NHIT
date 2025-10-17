import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRwfisComponent } from './edit-rwfis.component';

describe('EditRwfisComponent', () => {
  let component: EditRwfisComponent;
  let fixture: ComponentFixture<EditRwfisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRwfisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditRwfisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
