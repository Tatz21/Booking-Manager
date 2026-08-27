import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { HttpException } from '@nestjs/common';
import { SubscriptionGuard } from './subscription.guard';
import { TrialService } from '../trial.service';

describe('SubscriptionGuard', () => {
  let guard: SubscriptionGuard;
  let trialService: any;
  let reflector: any;

  beforeEach(async () => {
    trialService = {
      checkAccess: jest.fn(),
    };

    reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionGuard,
        { provide: TrialService, useValue: trialService },
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();

    guard = module.get<SubscriptionGuard>(SubscriptionGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when subscription or trial is active', async () => {
    trialService.checkAccess.mockResolvedValue(true);

    const context: any = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { businessId: 'biz-1' },
        }),
      }),
    };

    const allowed = await guard.canActivate(context);
    expect(allowed).toBe(true);
  });

  it('should throw 402 Payment Required when trial has expired and no subscription', async () => {
    trialService.checkAccess.mockResolvedValue(false);

    const context: any = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { businessId: 'biz-1' },
        }),
      }),
    };

    await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
  });
});
