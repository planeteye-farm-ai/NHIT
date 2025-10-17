import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRoadTypeComponent } from './add-road-type.component';

describe('AddRoadTypeComponent', () => {
  let component: AddRoadTypeComponent;
  let fixture: ComponentFixture<AddRoadTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRoadTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddRoadTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
