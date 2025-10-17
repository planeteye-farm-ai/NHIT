import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLabourComponent } from './edit-labour.component';

describe('EditLabourComponent', () => {
  let component: EditLabourComponent;
  let fixture: ComponentFixture<EditLabourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLabourComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditLabourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
