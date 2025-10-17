import { TestBed } from '@angular/core/testing';

import { RwfisManageService } from './rwfis-manage.service';

describe('RwfisManageService', () => {
  let service: RwfisManageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RwfisManageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
