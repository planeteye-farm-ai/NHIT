import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTopographyComponent } from './add-topography.component';

describe('AddTopographyComponent', () => {
  let component: AddTopographyComponent;
  let fixture: ComponentFixture<AddTopographyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTopographyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddTopographyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
