import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiIdentifierComponent } from './ai-identifier.component';

describe('AiIdentifierComponent', () => {
  let component: AiIdentifierComponent;
  let fixture: ComponentFixture<AiIdentifierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiIdentifierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AiIdentifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

