import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RwfisManageComponent } from './rwfis-manage.component';

describe('RwfisManageComponent', () => {
  let component: RwfisManageComponent;
  let fixture: ComponentFixture<RwfisManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RwfisManageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RwfisManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
