import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTrafficFileComponent } from './edit-traffic-file.component';

describe('EditTrafficFileComponent', () => {
  let component: EditTrafficFileComponent;
  let fixture: ComponentFixture<EditTrafficFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTrafficFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditTrafficFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
