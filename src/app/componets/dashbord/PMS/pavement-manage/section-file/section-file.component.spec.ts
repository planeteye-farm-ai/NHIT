import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionFileComponent } from './section-file.component';

describe('SectionFileComponent', () => {
  let component: SectionFileComponent;
  let fixture: ComponentFixture<SectionFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SectionFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
