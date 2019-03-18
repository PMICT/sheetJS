import { TestBed } from '@angular/core/testing';

import { SheetJSService } from './sheet-js.service';

describe('SheetJSService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SheetJSService = TestBed.get(SheetJSService);
    expect(service).toBeTruthy();
  });
});
