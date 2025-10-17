import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTrafficComponent } from './edit-traffic.component';

describe('EditTrafficComponent', () => {
  let component: EditTrafficComponent;
  let fixture: ComponentFixture<EditTrafficComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTrafficComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditTrafficComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
