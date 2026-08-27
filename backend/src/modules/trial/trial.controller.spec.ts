import { Test, TestingModule } from '@nestjs/testing';
import { TrialController } from './trial.controller';
import { TrialService } from './trial.service';

describe('TrialController', () => {
  let controller: TrialController;
  let service: any;

  beforeEach(async () => {
    service = {
      getSubscriptionStatus: jest.fn().mockResolvedValue({
        businessId: 'biz-1',
        plan: 'MONTHLY_STANDARD',
        status: 'TRIALING',
        canAccessPlatform: true,
        daysRemaining: 7,
        priceInr: 199,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrialController],
      providers: [{ provide: TrialService, useValue: service }],
    }).compile();

    controller = module.get<TrialController>(TrialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get subscription status for business', async () => {
    const res = await controller.getStatus('biz-1');
    expect(res.businessId).toBe('biz-1');
    expect(res.daysRemaining).toBe(7);
    expect(service.getSubscriptionStatus).toHaveBeenCalledWith('biz-1');
  });
});
