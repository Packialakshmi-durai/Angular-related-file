import { TestBed } from '@angular/core/testing';

import { MyoneService } from './myone.service';

describe('MyoneService', () => {
  let service: MyoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
