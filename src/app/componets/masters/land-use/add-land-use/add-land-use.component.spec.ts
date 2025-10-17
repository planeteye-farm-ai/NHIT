import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLandUseComponent } from './add-land-use.component';

describe('AddLandUseComponent', () => {
  let component: AddLandUseComponent;
  let fixture: ComponentFixture<AddLandUseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLandUseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddLandUseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
