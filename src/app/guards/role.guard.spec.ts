import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let roleGuard: RoleGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoleGuard]
    });
    roleGuard = TestBed.inject(RoleGuard);
  });

  it('should be created', () => {
    expect(roleGuard).toBeTruthy();
  });
});