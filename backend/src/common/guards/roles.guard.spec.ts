import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard';

function makeContext(user: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows execution when no roles are required', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const result = guard.canActivate(makeContext({ role: 'ADMIN' }));

    expect(result).toBe(true);
  });

  it('allows execution when user has required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['ADMIN']),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const result = guard.canActivate(makeContext({ role: 'ADMIN' }));

    expect(result).toBe(true);
  });

  it('throws when user role is missing', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['ADMIN']),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(makeContext({})) ).toThrow(ForbiddenException);
  });

  it('throws when user lacks required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['ADMIN', 'SALES']),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(makeContext({ role: 'PURCHASER' })) ).toThrow(ForbiddenException);
  });
});
