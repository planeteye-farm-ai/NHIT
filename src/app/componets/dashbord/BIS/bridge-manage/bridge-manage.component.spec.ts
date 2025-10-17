import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BridgeManageComponent } from './bridge-manage.component';

describe('BridgeManageComponent', () => {
  let component: BridgeManageComponent;
  let fixture: ComponentFixture<BridgeManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BridgeManageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BridgeManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
