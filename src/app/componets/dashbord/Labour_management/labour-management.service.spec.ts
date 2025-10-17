import { TestBed } from '@angular/core/testing';

import { LabourManagementService } from './labour-management.service';

describe('LabourManagementService', () => {
  let service: LabourManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabourManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
