import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRoadComponent } from './add-road.component';

describe('AddRoadComponent', () => {
  let component: AddRoadComponent;
  let fixture: ComponentFixture<AddRoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRoadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddRoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
