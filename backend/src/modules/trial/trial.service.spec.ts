import { Test, TestingModule } from '@nestjs/testing';
import { TrialService } from './trial.service';
import { PrismaService } from '../../database/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

describe('TrialService', () => {
  let service: TrialService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      subscription: {
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrialService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TrialService>(TrialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should grant access when 7-day trial is active', async () => {
    const activeTrialEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days left
    prisma.subscription.findUnique.mockResolvedValue({
      id: 'sub-1',
      businessId: 'biz-1',
      plan: 'MONTHLY_STANDARD',
      status: SubscriptionStatus.TRIALING,
      trialStart: new Date(),
      trialEnd: activeTrialEnd,
      currentPeriodEnd: null,
    });

    const status = await service.getSubscriptionStatus('biz-1');
    expect(status.canAccessPlatform).toBe(true);
    expect(status.isTrialActive).toBe(true);
    expect(status.daysRemaining).toBe(5);
  });

  it('should deny access when 7-day trial has expired and update status', async () => {
    const expiredTrialEnd = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // Expired yesterday
    prisma.subscription.findUnique.mockResolvedValue({
      id: 'sub-1',
      businessId: 'biz-1',
      plan: 'MONTHLY_STANDARD',
      status: SubscriptionStatus.TRIALING,
      trialStart: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      trialEnd: expiredTrialEnd,
      currentPeriodEnd: null,
    });

    const status = await service.getSubscriptionStatus('biz-1');
    expect(status.canAccessPlatform).toBe(false);
    expect(status.isTrialActive).toBe(false);
    expect(status.status).toBe(SubscriptionStatus.EXPIRED);
  });

  it('should grant access when paid subscription is active', async () => {
    const activePeriodEnd = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
    prisma.subscription.findUnique.mockResolvedValue({
      id: 'sub-1',
      businessId: 'biz-1',
      plan: 'MONTHLY_STANDARD',
      status: SubscriptionStatus.ACTIVE,
      trialStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      trialEnd: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: activePeriodEnd,
    });

    const status = await service.getSubscriptionStatus('biz-1');
    expect(status.canAccessPlatform).toBe(true);
    expect(status.isSubscriptionActive).toBe(true);
  });
});
