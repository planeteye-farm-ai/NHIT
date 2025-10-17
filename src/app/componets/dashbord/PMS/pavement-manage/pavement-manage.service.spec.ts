import { TestBed } from '@angular/core/testing';

import { PavementManageService } from './pavement-manage.service';

describe('PavementManageService', () => {
  let service: PavementManageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PavementManageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
