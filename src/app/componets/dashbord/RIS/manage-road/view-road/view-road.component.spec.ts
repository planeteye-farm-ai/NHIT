import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRoadComponent } from './view-road.component';

describe('ViewRoadComponent', () => {
  let component: ViewRoadComponent;
  let fixture: ComponentFixture<ViewRoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRoadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
