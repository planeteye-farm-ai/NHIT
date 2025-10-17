import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRwfisComponent } from './view-rwfis.component';

describe('ViewRwfisComponent', () => {
  let component: ViewRwfisComponent;
  let fixture: ComponentFixture<ViewRwfisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRwfisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRwfisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
