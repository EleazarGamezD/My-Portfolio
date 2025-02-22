import { TestBed } from '@angular/core/testing';

import { GlobalHttpService } from './global-http.service';

describe('GlobalHttpService', () => {
  let service: GlobalHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
