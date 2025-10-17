import { TestBed } from '@angular/core/testing';

import { ManageAccidentService } from './manage-accident.service';

describe('ManageAccidentService', () => {
  let service: ManageAccidentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageAccidentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
