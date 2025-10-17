import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWorkorderComponent } from './add-workorder.component';

describe('AddWorkorderComponent', () => {
  let component: AddWorkorderComponent;
  let fixture: ComponentFixture<AddWorkorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWorkorderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddWorkorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
