import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSectionFileComponent } from './edit-section-file.component';

describe('EditSectionFileComponent', () => {
  let component: EditSectionFileComponent;
  let fixture: ComponentFixture<EditSectionFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSectionFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditSectionFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
