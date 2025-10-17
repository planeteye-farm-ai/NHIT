import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTrafficFileComponent } from './view-traffic-file.component';

describe('ViewTrafficFileComponent', () => {
  let component: ViewTrafficFileComponent;
  let fixture: ComponentFixture<ViewTrafficFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTrafficFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewTrafficFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
