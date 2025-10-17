import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionFilePdfComponent } from './section-file-pdf.component';

describe('SectionFilePdfComponent', () => {
  let component: SectionFilePdfComponent;
  let fixture: ComponentFixture<SectionFilePdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFilePdfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SectionFilePdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
