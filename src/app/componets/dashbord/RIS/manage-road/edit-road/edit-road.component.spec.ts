import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRoadComponent } from './edit-road.component';

describe('EditRoadComponent', () => {
  let component: EditRoadComponent;
  let fixture: ComponentFixture<EditRoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRoadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditRoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
