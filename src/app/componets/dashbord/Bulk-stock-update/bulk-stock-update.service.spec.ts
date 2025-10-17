import { TestBed } from '@angular/core/testing';

import { BulkStockUpdateService } from './bulk-stock-update.service';

describe('BulkStockUpdateService', () => {
  let service: BulkStockUpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BulkStockUpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
