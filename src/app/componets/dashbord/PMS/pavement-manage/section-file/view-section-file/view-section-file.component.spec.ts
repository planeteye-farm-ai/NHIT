import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSectionFileComponent } from './view-section-file.component';

describe('ViewSectionFileComponent', () => {
  let component: ViewSectionFileComponent;
  let fixture: ComponentFixture<ViewSectionFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSectionFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewSectionFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
