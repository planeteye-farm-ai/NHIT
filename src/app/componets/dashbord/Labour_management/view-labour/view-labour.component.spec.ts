import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLabourComponent } from './view-labour.component';

describe('ViewLabourComponent', () => {
  let component: ViewLabourComponent;
  let fixture: ComponentFixture<ViewLabourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewLabourComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewLabourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
