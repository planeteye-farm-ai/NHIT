import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabourManagementComponent } from './labour-management.component';

describe('LabourManagementComponent', () => {
  let component: LabourManagementComponent;
  let fixture: ComponentFixture<LabourManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabourManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LabourManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
