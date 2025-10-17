import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRoadComponent } from './manage-road.component';

describe('ManageRoadComponent', () => {
  let component: ManageRoadComponent;
  let fixture: ComponentFixture<ManageRoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRoadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageRoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
