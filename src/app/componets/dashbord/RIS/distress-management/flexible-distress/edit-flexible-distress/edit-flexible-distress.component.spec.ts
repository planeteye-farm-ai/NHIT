import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFlexibleDistressComponent } from './edit-flexible-distress.component';

describe('EditFlexibleDistressComponent', () => {
  let component: EditFlexibleDistressComponent;
  let fixture: ComponentFixture<EditFlexibleDistressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditFlexibleDistressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditFlexibleDistressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
