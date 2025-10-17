import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSectionFileComponent } from './add-section-file.component';

describe('AddSectionFileComponent', () => {
  let component: AddSectionFileComponent;
  let fixture: ComponentFixture<AddSectionFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSectionFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSectionFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
