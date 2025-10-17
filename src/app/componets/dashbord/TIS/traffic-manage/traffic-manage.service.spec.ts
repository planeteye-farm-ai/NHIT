import { TestBed } from '@angular/core/testing';

import { TrafficManageService } from './traffic-manage.service';

describe('TrafficManageService', () => {
  let service: TrafficManageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrafficManageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
