import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { PaymentsService } from './payments.service';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let paymentsService: any;

  beforeEach(async () => {
    paymentsService = {
      processWebhook: jest.fn().mockResolvedValue({ status: 'success', message: 'Webhook handled' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [{ provide: PaymentsService, useValue: paymentsService }],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should process webhook', async () => {
    const payload = { event: 'payment.captured' };
    const req: any = { rawBody: 'raw' };
    const res = await controller.handleRazorpayWebhook('valid-sig', payload, req);
    expect(res.status).toBe('success');
    expect(paymentsService.processWebhook).toHaveBeenCalledWith('raw', 'valid-sig', payload);
  });
});
