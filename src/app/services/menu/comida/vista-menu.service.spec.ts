import { TestBed } from '@angular/core/testing';

import { VistaMenuService } from './vista-menu.service';

describe('VistaMenuService', () => {
  let service: VistaMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VistaMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
